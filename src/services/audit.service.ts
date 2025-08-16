import AuditLog, { IAuditLog } from "../models/AuditLog";
import { Types } from "mongoose";

class AuditLogService {
  static async logAuditEntry(
    action: "CREATE" | "UPDATE" | "DELETE",
    collectionName: string,
    documentId: Types.ObjectId,
    changes: any,
    userId?: Types.ObjectId
  ): Promise<IAuditLog | undefined> {
    try {
      const auditLog = AuditLog.create({
        action,
        collectionName,
        documentId,
        changes,
        userId,
        timestamp: new Date(),
      });

      return auditLog;
    } catch (e) {
      console.log("failed to create log entry: ", e);
    }
  }
}

export default AuditLogService;
