import Queue from 'bull';
import { SERVER_CONFIG } from '../config/serverConfig';
import { NotificationModel } from '../models/notification.model';
import { UserRepository } from '../repositories/userRepository';

interface NotificationJob {
    notificationId: string;
    recipientId: string;
}

class NotificationQueue {
    private queue: Queue.Queue<NotificationJob>;
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.queue = new Queue<NotificationJob>('notifications', SERVER_CONFIG.REDIS_URL || '', {
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: true,
                removeOnFail: false,
            },
        });
        

        this.setupQueue();
    }

    private setupQueue(): void {
        // Process jobs
        this.queue.process(async (job) => {
            return this.processNotification(job.data);
        });

        // Handle failed jobs
        this.queue.on('failed', async (job, err) => {
            console.error(`Job ${job.id} failed:`, err);
            await this.handleFailedJob(job.data, err);
        });

        // Handle completed jobs
        this.queue.on('completed', async (job) => {
            console.log(`Job ${job.id} completed successfully`);
        });

        // Handle queue errors
        this.queue.on('error', (err) => {
            console.error('Queue error:', err);
        });

        // Handle Redis connection issues
        const connection = this.queue.client;
        connection.on('error', (err) => {
            console.error('Redis connection error:', err);
        });
        connection.on('connect', () => {
            console.log('Connected to Redis successfully');
        });
    }

    private async processNotification(jobData: NotificationJob): Promise<void> {
        const { notificationId, recipientId } = jobData;

        // Get notification and recipient
        const [notification, recipient] = await Promise.all([
            NotificationModel.findById(notificationId),
            this.userRepository.findById(recipientId)
        ]);

        if (!notification) {
            throw new Error(`Notification ${notificationId} not found`);
        }

        if (!recipient) {
            throw new Error(`Recipient ${recipientId} not found`);
        }

        // Check if user is available now
        const isAvailable = this.checkUserAvailability(recipient);
        if (!isAvailable) {
            // If user is still not available, throw error to trigger backoff
            throw new Error('User not available');
        }

        try {
            // Implement your notification delivery logic here
            // This could be sending through WebSocket, email, push notification, etc.
            await this.deliverNotification(notification, recipient);

            // Update notification status
            await NotificationModel.updateOne(
                { _id: notificationId },
                {
                    $set: {
                        [`deliveryStatus.${recipientId}`]: {
                            status: 'delivered',
                            deliveredAt: new Date()
                        }
                    }
                }
            );
        } catch (error) {
            console.error(`Failed to deliver notification ${notificationId} to ${recipientId}:`, error);
            throw error; // This will trigger the failed event
        }
    }

    private checkUserAvailability(user: any): boolean {
        if (!user.availabilityTime || user.availabilityTime.length === 0) {
            return true; // Default to available if no availability set
        }

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;

        return user.availabilityTime.some(({ start, end }: { start: string; end: string }) => {
            return currentTimeString >= start && currentTimeString <= end;
        });
    }

    private async deliverNotification(notification: any, recipient: any): Promise<void> {
        // Implement your actual delivery logic here
        // This is just a placeholder
        console.log(`Delivering notification ${notification._id} to user ${recipient._id}`);
        
        // Simulate some async work
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    private async handleFailedJob(jobData: NotificationJob, error: Error): Promise<void> {
        const { notificationId, recipientId } = jobData;

        await NotificationModel.updateOne(
            { _id: notificationId },
            {
                $set: {
                    [`deliveryStatus.${recipientId}`]: {
                        status: 'failed',
                        error: error.message
                    }
                }
            }
        );
    }

    async addJob(notificationId: string, recipientId: string, delay: number = 0): Promise<void> {
        await this.queue.add(
            { notificationId, recipientId },
            {
                delay,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000
                }
            }
        );
    }

    async cleanup(): Promise<void> {
        await this.queue.clean(1000, 'completed');
        await this.queue.clean(1000, 'failed');
    }

    async close(): Promise<void> {
        await this.queue.close();
    }
}

// Create and export a singleton instance
export const notificationQueue = new NotificationQueue();