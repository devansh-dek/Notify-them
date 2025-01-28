import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../interfaces/user.interface';

export interface UserDocument extends User, Document {
    comparePassword(password: string): Promise<boolean>;
}

const availabilityTimeSchema = new Schema({
    start: {
        type: String,
        required: true,
        validate: {
            validator: (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
            message: 'Start time must be in HH:mm format'
        }
    },
    end: {
        type: String,
        required: true,
        validate: {
            validator: (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
            message: 'End time must be in HH:mm format'
        }
    }
});

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: (v: string) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
            message: 'Please enter a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    mobileNumber: {
        type: String,
        required: true,
        validate: {
            validator: (v: string) => /^\+?[\d\s-]{10,}$/.test(v),
            message: 'Please enter a valid mobile number'
        }
    },
    bio: {
        type: String,
        maxlength: 500
    },
    availabilityTime: [availabilityTimeSchema],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model<UserDocument>('User', userSchema);

export default UserModel;