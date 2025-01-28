export interface User {
    name: string;
    email: string;
    password: string;
    mobileNumber: string;
    bio?: string;
    availabilityTime: {
        start: string;
        end: string;
    }[];
    role: 'user' | 'admin';
}

// Separate interface for responses to avoid exposing sensitive data
export interface UserResponse extends Omit<User, 'password'> {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}