import AuditLog, { IAuditLog } from "../models/AuditLog";
import { Types } from "mongoose";

class AuditLogService {
  // Main method to log audit entries with optional parent relationship
  static async logAuditEntry(
    type: "CREATE" | "UPDATE" | "DELETE",
    collectionName: string,
    documentId: Types.ObjectId,
    changes: any,
    userId: Types.ObjectId,
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    parent?: Types.ObjectId
  ): Promise<IAuditLog | undefined> {
    try {
      const auditLog = await AuditLog.create({
        type,
        collectionName,
        documentId,
        changes,
        userId,
        method,
        parent,
      });

      return auditLog;
    } catch (e) {
      console.log("failed to create log entry: ", e);
    }
  }

  // Get audit trail for a specific document (useful for tracking linked operations)
  static async getAuditTrail(documentId: Types.ObjectId): Promise<IAuditLog[]> {
    try {
      return await AuditLog.find({ documentId })
        .populate("parent")
        .populate("userId", "name email")
        .sort({ timestamp: 1 });
    } catch (e) {
      console.log("failed to get audit trail: ", e);
      return [];
    }
  }

  // Get all child audit logs for a parent audit log
  static async getChildAuditLogs(
    parentId: Types.ObjectId
  ): Promise<IAuditLog[]> {
    try {
      return await AuditLog.find({ parent: parentId })
        .populate("userId", "name email")
        .sort({ timestamp: 1 });
    } catch (e) {
      console.log("failed to get child audit logs: ", e);
      return [];
    }
  }

  // Create a linked audit log (references a parent audit log)
  static async logLinkedAuditEntry(
    type: "CREATE" | "UPDATE" | "DELETE",
    collectionName: string,
    documentId: Types.ObjectId,
    changes: any,
    userId: Types.ObjectId,
    parentAuditLogId: Types.ObjectId,
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  ): Promise<IAuditLog | undefined> {
    return this.logAuditEntry(
      type,
      collectionName,
      documentId,
      changes,
      userId,
      method,
      parentAuditLogId
    );
  }
}

export default AuditLogService;
