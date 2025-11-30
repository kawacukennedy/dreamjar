import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../models/User";

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getUserById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId);
  }

  async getUserByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username });
  }

  async updateUser(
    userId: string,
    updateData: Partial<UserDocument>,
  ): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
  }

  async createUser(userData: Partial<UserDocument>): Promise<UserDocument> {
    const user = new this.userModel(userData);
    return user.save();
  }
}
