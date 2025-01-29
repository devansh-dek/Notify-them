import { NotificationModel, NotificationDocument } from '../models/notification.model';
import { UserRepository } from '../repositories/userRepository';
import { notificationQueue } from './notificationQueue';
import { AuthorizationError } from '../utils/errors';
import { Types } from 'mongoose';
import { UserDocument } from '../models/user.model';


export class NotificationService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async createNotification(
        senderId: string,
        recipientIds: string[],
        message: string,
        type: 'critical' | 'non-critical'
    ): Promise<NotificationDocument> {
        // Validate sender
        const sender = await this.userRepository.findById(senderId);
        if (!sender ) {
            throw new Error("Cannot find the sender, Invalid Sender Id");
        }
        if(sender.role !== 'admin'){
            type = 'non-critical'
        }

        // Create notification
        const notification = await NotificationModel.create({
            sender: senderId,
            recipients: recipientIds,
            message,
            type
        });

        // Process notification based on type
        if (type === 'critical') {
            await this.deliverImmediately(notification);
        } else {
            await this.queueBasedOnAvailability(notification);
        }

        return notification;
    }

    private async deliverImmediately(notification: NotificationDocument): Promise<void> {
        const recipientPromises = notification.recipients.map(async (recipientId) => {
            await this.deliverToUser(notification._id.toString(), recipientId.toString());
        });

        await Promise.all(recipientPromises);
        
        notification.status = 'delivered';
        notification.deliveredAt = new Date();
        await notification.save();
    }

    private async queueBasedOnAvailability(notification: NotificationDocument): Promise<void> {
        const recipientPromises = notification.recipients.map(async (recipientId) => {
            const recipient = await this.userRepository.findById(recipientId.toString());
            if (!recipient) return;

            if (this.isUserAvailable(recipient)) {
                await this.deliverToUser(notification._id.toString(), recipientId.toString());
            } else {
                const nextAvailableTime = this.getNextAvailableTime(recipient);
                await this.queueNotification(notification._id.toString(), recipientId.toString(), nextAvailableTime);
            }
        });

        await Promise.all(recipientPromises);
    }

    private isUserAvailable(user: UserDocument): boolean {
        if (!user.availabilityTime || user.availabilityTime.length === 0) {
            return true; 
        }

        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();
        const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;

        return user.availabilityTime.some(({ start, end }) => {
            return currentTimeString >= start && currentTimeString <= end;
        });
    }

    private getNextAvailableTime(user: UserDocument): Date {
        if (!user.availabilityTime || user.availabilityTime.length === 0) {
            return new Date(); // Default to immediate delivery
        }

        const currentDate = new Date();
        const currentHour = currentDate.getHours();
        const currentMinutes = currentDate.getMinutes();

        // Find the next available time slot
        for (const { start } of user.availabilityTime) {
            const [startHour, startMinute] = start.split(':').map(Number);
            if (startHour > currentHour || (startHour === currentHour && startMinute > currentMinutes)) {
                const nextAvailable = new Date();
                nextAvailable.setHours(startHour, startMinute, 0, 0);
                return nextAvailable;
            }
        }

        // If no time slot found today, schedule for first slot tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [firstSlotHour, firstSlotMinute] = user.availabilityTime[0].start.split(':').map(Number);
        tomorrow.setHours(firstSlotHour, firstSlotMinute, 0, 0);
        return tomorrow;
    }

    private async queueNotification(
        notificationId: string,
        recipientId: string,
        scheduledFor: Date
    ): Promise<void> {
        const delay = Math.max(scheduledFor.getTime() - Date.now(), 0); 
        await notificationQueue.addJob(notificationId, recipientId, delay);
    }
    

    private async deliverToUser(notificationId: string, recipientId: string): Promise<void> {
        // Here you would implement the actual delivery logic
        console.log(`Delivering notification ${notificationId} to user ${recipientId}`);
        
        // Update notification status for this recipient to delivered
        await NotificationModel.updateOne(
            { _id: notificationId },
            {
                $set: {
                    status: 'delivered',
                    deliveredAt: new Date()
                }
            }
        );
    }

    async getUserNotifications(userId: string): Promise<NotificationDocument[]> {
        // fetching all delivered notifications
        return NotificationModel.find({
            recipients: userId,
            status : 'delivered'
        })
        .populate('sender', 'name email')
        .sort({ createdAt: -1 })
        .exec();
    }
}
