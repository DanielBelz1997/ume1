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
    actingUserId?: Types.ObjectId,
    method: "POST" | "PUT" | "PATCH" = "POST"
  ): Promise<IUser> {
    const user = await User.create(data);

    if (user && actingUserId) {
      await AuditLogService.logAuditEntry(
        "CREATE",
        "User",
        user._id as Types.ObjectId,
        data,
        actingUserId,
        method
      );
    }

    return user;
  }

  static async update(
    id: string,
    data: Partial<IUser>,
    actingUserId?: Types.ObjectId,
    method: "PUT" | "PATCH" = "PUT",
    parentAuditLogId?: Types.ObjectId
  ): Promise<{ user: IUser | null; auditLog?: any }> {
    const user = await User.findByIdAndUpdate(id, data, { new: true });

    let auditLog;
    if (user && actingUserId) {
      if (parentAuditLogId) {
        // Create linked audit log
        auditLog = await AuditLogService.logLinkedAuditEntry(
          "UPDATE",
          "User",
          user._id as Types.ObjectId,
          data,
          actingUserId,
          parentAuditLogId,
          method
        );
      } else {
        // Create regular audit log
        auditLog = await AuditLogService.logAuditEntry(
          "UPDATE",
          "User",
          user._id as Types.ObjectId,
          data,
          actingUserId,
          method
        );
      }
    }

    return { user, auditLog };
  }

  static async delete(
    id: string,
    actingUserId?: Types.ObjectId,
    method: "DELETE" = "DELETE"
  ): Promise<IUser | null> {
    const user = await User.findByIdAndDelete(id);

    if (user && actingUserId) {
      await AuditLogService.logAuditEntry(
        "DELETE",
        "User",
        user._id as Types.ObjectId,
        user,
        actingUserId,
        method
      );
    }

    return user;
  }
}

export default UserService;
