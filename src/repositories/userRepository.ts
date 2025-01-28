import { User } from '../interfaces/user.interface';
import UserModel, { UserDocument } from '../models/user.model';

export class UserRepository {
    async create(userData: User): Promise<UserDocument> {
        const user = new UserModel(userData);
        return await user.save();
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return await UserModel.findOne({ email });
    }

    async findById(id: string): Promise<UserDocument | null> {
        return await UserModel.findById(id);
    }

    async update(id: string, updateData: Partial<User>): Promise<UserDocument | null> {
        return await UserModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
    }

    async delete(id: string): Promise<UserDocument | null> {
        return await UserModel.findByIdAndDelete(id);
    }

    async findAll(): Promise<UserDocument[]> {
        return await UserModel.find({});
    }
}

export default UserRepository;