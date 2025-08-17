import { Request, Response } from "express";
import AuditLogService from "../services/audit.service";
import { Types } from "mongoose";

class AuditController {
  // Get audit trail for a specific document
  static async getAuditTrail(req: Request, res: Response) {
    try {
      const { documentId } = req.params;

      if (!Types.ObjectId.isValid(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }

      const auditTrail = await AuditLogService.getAuditTrail(
        new Types.ObjectId(documentId)
      );

      res.json(auditTrail);
    } catch (e) {
      console.error("Error getting audit trail:", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Get child audit logs for a parent audit log
  static async getChildAuditLogs(req: Request, res: Response) {
    try {
      const { parentId } = req.params;

      if (!Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: "Invalid parent audit log ID" });
      }

      const childLogs = await AuditLogService.getChildAuditLogs(
        new Types.ObjectId(parentId)
      );

      res.json(childLogs);
    } catch (e) {
      console.error("Error getting child audit logs:", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Manual audit log creation (for testing or special cases)
  static async createAuditLog(req: Request, res: Response) {
    try {
      const {
        type,
        collectionName,
        documentId,
        changes,
        userId,
        method,
        parent,
      } = req.body;

      // Basic validation
      if (!type || !collectionName || !documentId || !userId) {
        return res.status(400).json({
          message:
            "Missing required fields: type, collectionName, documentId, userId",
        });
      }

      if (
        !Types.ObjectId.isValid(documentId) ||
        !Types.ObjectId.isValid(userId)
      ) {
        return res.status(400).json({ message: "Invalid ObjectId format" });
      }

      if (parent && !Types.ObjectId.isValid(parent)) {
        return res
          .status(400)
          .json({ message: "Invalid parent ObjectId format" });
      }

      const auditLog = await AuditLogService.logAuditEntry(
        type,
        collectionName,
        new Types.ObjectId(documentId),
        changes,
        new Types.ObjectId(userId),
        method,
        parent ? new Types.ObjectId(parent) : undefined
      );

      if (!auditLog) {
        return res.status(500).json({ message: "Failed to create audit log" });
      }

      res.status(201).json(auditLog);
    } catch (e) {
      console.error("Error creating audit log:", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Create a linked audit log (demonstrates parent relationship)
  static async createLinkedAuditLog(req: Request, res: Response) {
    try {
      const {
        type,
        collectionName,
        documentId,
        changes,
        userId,
        parentAuditLogId,
        method,
      } = req.body;

      // Basic validation
      if (
        !type ||
        !collectionName ||
        !documentId ||
        !userId ||
        !parentAuditLogId
      ) {
        return res.status(400).json({
          message:
            "Missing required fields: type, collectionName, documentId, userId, parentAuditLogId",
        });
      }

      const requiredIds = [documentId, userId, parentAuditLogId];
      if (requiredIds.some((id) => !Types.ObjectId.isValid(id))) {
        return res.status(400).json({ message: "Invalid ObjectId format" });
      }

      const auditLog = await AuditLogService.logLinkedAuditEntry(
        type,
        collectionName,
        new Types.ObjectId(documentId),
        changes,
        new Types.ObjectId(userId),
        new Types.ObjectId(parentAuditLogId),
        method
      );

      if (!auditLog) {
        return res
          .status(500)
          .json({ message: "Failed to create linked audit log" });
      }

      res.status(201).json(auditLog);
    } catch (e) {
      console.error("Error creating linked audit log:", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default AuditController;
