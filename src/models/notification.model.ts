import mongoose, { Schema, Document, Types } from 'mongoose';

interface DeliveryStatus {
    status: 'pending' | 'delivered' | 'failed';
    deliveredAt?: Date;
    error?: string;
}

export interface NotificationDocument extends Document {
    _id: Types.ObjectId;
    sender: Types.ObjectId;
    recipients: Types.ObjectId[];
    message: string;
    type: 'critical' | 'non-critical';
    status: 'pending' | 'delivered' | 'failed';
    scheduledFor?: Date;
    deliveredAt?: Date;
    deliveryStatus: Record<string, DeliveryStatus>;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipients: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    message: {
        type: String,
        required: true,
        maxlength: 500
    },
    type: {
        type: String,
        enum: ['critical', 'non-critical'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'delivered', 'failed'],
        default: 'pending'
    },
    scheduledFor: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    deliveryStatus: {
        type: Map,
        of: {
            status: {
                type: String,
                enum: ['pending', 'delivered', 'failed']
            },
            deliveredAt: Date,
            error: String
        },
        default: {}
    }
}, {
    timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipients: 1, status: 1, createdAt: -1 });
notificationSchema.index({ sender: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<NotificationDocument>('Notification', notificationSchema);