import { Request, Response } from 'express';
import { UserRepository } from '../repositories/userRepository';

export class UserController {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    updateProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user._id;
            const updateData = req.body;
            
            // Remove sensitive fields that shouldn't be updated directly
            delete updateData.password;
            delete updateData.email;
            delete updateData.role;

            const updatedUser = await this.userRepository.update(userId, updateData);

            if (!updatedUser) {
                res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: {
                    user: {
                        _id: updatedUser._id,
                        email: updatedUser.email,
                        name: updatedUser.name,
                        mobileNumber: updatedUser.mobileNumber,
                        bio: updatedUser.bio,
                        availabilityTime: updatedUser.availabilityTime,
                        role: updatedUser.role,
                        createdAt: updatedUser.createdAt,
                        updatedAt: updatedUser.updatedAt
                    }
                }
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    };
}