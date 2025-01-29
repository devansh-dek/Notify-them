import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

export class NotificationController {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    createNotification = async (req: Request, res: Response): Promise<void> => {
        try {
            const { recipientIds, message, type } = req.body;
            const notification = await this.notificationService.createNotification(
                req.user._id,
                recipientIds,
                message,
                type
            );

            res.status(201).json({
                success: true,
                data: { notification }
            });
        } catch (error: any) {
            res.status(error.statusCode || 400).json({
                success: false,
                error: error.message
            });
        }
    };

    getUserNotifications = async (req: Request, res: Response): Promise<void> => {
        try {
            const notifications = await this.notificationService.getUserNotifications(req.user._id);
            
            res.status(200).json({
                success: true,
                data: { notifications }
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    };
}

