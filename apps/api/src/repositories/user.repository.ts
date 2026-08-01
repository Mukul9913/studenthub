import { UserModel, type IUser } from "../models/user.model.js";

export class UserRepository {
  async create(data: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(data);
    return await user.save();
  }

  async findById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email: email.toLowerCase() }).select("+passwordHash").exec();
  }

  async findByPhone(phone: string): Promise<IUser | null> {
    return await UserModel.findOne({ phone }).exec();
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
