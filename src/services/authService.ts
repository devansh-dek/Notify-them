import { User, UserResponse } from '../interfaces/user.interface';
import { AuthenticationError } from '../utils/errors';
import UserRepository from '../repositories/userRepository';
import jwt, { Secret } from 'jsonwebtoken';
import { SERVER_CONFIG } from '../config/serverConfig';
import { UserDocument } from '../models/user.model';

export interface AuthResponse {
    token: string;
    user: UserResponse;
}

export class AuthService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async register(userData: Pick<User, 'email' | 'password'>): Promise<AuthResponse> {
        const existingUser = await this.userRepository.findByEmail(userData.email);
        
        if (existingUser) {
            throw new AuthenticationError('Email already registered');
        }

        const user = await this.userRepository.create({
            ...userData,
            role: 'user'
        });
        
        const token = this.generateToken(user);

        return {
            token,
            user: this.sanitizeUser(user)
        };
    }
    async login(email: string, password: string): Promise<AuthResponse> {
        const user = await this.userRepository.findByEmail(email);
        
        if (!user || !(await user.comparePassword(password))) {
            throw new AuthenticationError('Invalid credentials');
        }

        const token = this.generateToken(user);

        return {
            token,
            user: this.sanitizeUser(user)
        };
    }


    private generateToken(user: UserDocument): string {
        return jwt.sign(
            { 
                _id: user._id, 
                role: user.role 
            },
            SERVER_CONFIG.JWT_SECRET as Secret, 
            { 
                expiresIn: '24h'
            }
        );
    }
    
    private sanitizeUser(user: UserDocument): UserResponse {
        return {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            mobileNumber: user.mobileNumber,
            bio: user.bio,
            availabilityTime: user.availabilityTime,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
}

export default new AuthService();