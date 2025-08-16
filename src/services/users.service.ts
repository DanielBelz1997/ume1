import User, { IUser } from "../models/User";
import AuditLogService from "./audit.service";
import { Types } from "mongoose";

class UserService {
  static async getAll(): Promise<IUser[]> {
    return User.find();
  }

  static async getById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  static async create(
    data: Partial<IUser>,
    userId?: Types.ObjectId
  ): Promise<IUser> {
    const user = await User.create(data);

    if (user) {
      await AuditLogService.logAuditEntry(
        "CREATE",
        "User",
        user._id as Types.ObjectId,
        data,
        userId
      );
    }

    return user;
  }

  static async update(
    id: string,
    data: Partial<IUser>,
    userId?: Types.ObjectId
  ): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(id, data, { new: true });

    if (user) {
      await AuditLogService.logAuditEntry(
        "UPDATE",
        "User",
        user._id as Types.ObjectId,
        data,
        userId
      );
    }

    return user;
  }

  static async delete(
    id: string,
    userId?: Types.ObjectId
  ): Promise<IUser | null> {
    const user = await User.findByIdAndDelete(id);

    if (user) {
      await AuditLogService.logAuditEntry(
        "DELETE",
        "User",
        user._id as Types.ObjectId,
        user,
        userId
      );
    }

    return user;
  }
}

export default UserService;
