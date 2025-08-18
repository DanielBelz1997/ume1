/**
 * Technical Interview Simulation - Audit Log System
 * =================================================
 *
 * Welcome to the technical interview!
 *
 * During this interview you will be asked to build an audit log system that tracks user actions in the system.
 * The interview will be divided into 5 phases:
 *
 * Phase 1: Define Audit Log Interface
 * Phase 2: Create Mongoose Schema
 * Phase 3: Develop Service Layer
 * Phase 4: Build Controller and Router
 * Phase 5: Integrate with User CRUD operations
 *
 * Instructions:
 * - You can use Stack Overflow, AI, or search the internet
 * - Work step by step
 * - Don't move to the next phase before finishing the current one
 * - Explain your decisions
 */

import { Schema, model, Document, Types } from "mongoose";
import { Request, Response, Router } from "express";

// =============================================================================
// Phase 1: Define Audit Log Interface
// =============================================================================
/**
 * Goal: Define an interface for Audit Log that will track system operations
 *
 * Requirements:
 * 1. userId - ID of the user who performed the action
 * 2. type - Type of operation (CREATE, UPDATE, DELETE)
 * 3. method - HTTP method (optional)
 * 4. parent - Link to another audit log (for linked operations)
 * 5. timestamp - Time when the action was performed
 * 6. Additional fields as you see fit
 *
 * Start here:
 */

// TODO: Define the interface here
export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  documentId: Types.ObjectId;
  collectionName: string;
  changes: any;
  action: "CREATE" | "UPDATE" | "DELETE";
  timestamp?: Date;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  parent?: Types.ObjectId;
}

// =============================================================================
// Phase 2: Create Mongoose Schema
// =============================================================================
/**
 * Goal: Create a Mongoose Schema for the Audit Log
 *
 * Requirements:
 * 1. Use the interface you defined
 * 2. Add appropriate validations
 * 3. Define references to other models
 * 4. Add default values where needed
 *
 * Start here:
 */

const AuditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  documentId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  collectionName: {
    type: String,
    required: true,
  },
  changes: {
    type: Schema.Types.Mixed,
    required: true,
  },
  action: {
    type: String,
    enum: ["CREATE", "UPDATE", "DELETE"],
    required: true,
  },
  method: {
    type: String,
    enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: "AuditLog",
  },
});

// TODO: Create and export the model
export const AuditLogModel = model<IAuditLog>("AuditLog", AuditLogSchema);

// =============================================================================
// Phase 3: Develop Service Layer
// =============================================================================
/**
 * Goal: Create a service layer for managing audit logs
 *
 * Requirements:
 * 1. Function to create new audit log
 * 2. Function to get audit trail of a specific document
 * 3. Function to get child audit logs
 * 4. Function to create linked audit log
 * 5. Proper error handling
 *
 * Start here:
 */

export class AuditLogService {
  static async createAuditLog(params: IAuditLog) {
    try {
      const { action, changes, collectionName, documentId, method, userId } =
        params;

      if (
        !action ||
        !changes ||
        !collectionName ||
        !documentId ||
        !method ||
        !userId
      ) {
        throw new Error("some params are missing in the audit log params");
      }

      const auditLog = await AuditLogModel.create(params);

      return auditLog;
    } catch (e) {
      console.log("error creating an audit log:", e);
    }
  }

  static async getDocumentAuditLog(documentId: string) {
    try {
      return await AuditLogModel.find({ documentId })
        .populate("parent")
        .populate("userId", "name email")
        .sort({ timestamp: 1 });
    } catch (e) {
      console.log("unable to create an audit log: ", e);
      throw new Error("unable to create an audit log: ");
    }
  }

  static async getParentChildAuditLogs(parent: IAuditLog["parent"]) {
    try {
      return await AuditLogModel.find({ parent }).populate(
        "userId",
        "name email"
      );
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  static async createLinkedAuditLog(params: IAuditLog) {
    try {
      if (!params.parent) {
        throw new Error("there is no parent to this audit log");
      }

      const auditLog = await AuditLogService.createAuditLog(params);

      return auditLog;
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }
}

// =============================================================================
// Phase 4: Build Controller and Router
// =============================================================================
/**
 * Goal: Create REST API for audit logs
 *
 * Controller Requirements:
 * 1. GET /audit/trail/:documentId - get audit trail
 * 2. GET /audit/children/:parentId - get child logs
 * 3. POST /audit - create manual audit log
 * 4. POST /audit/linked - create linked audit log
 * 5. proper validation and error handling
 *
 * Start here:
 */

export class AuditController {
  static async getAuditLog(req: Request, res: Response) {
    try {
      const auditLog = await AuditLogService.getDocumentAuditLog(req.params.id);

      if (!auditLog) {
        return res
          .status(404)
          .json({ message: "no log by this document to be found" });
      }

      res.json(auditLog);
    } catch (e) {
      console.log("unable to create an audit log", e);
      res
        .status(500)
        .json({ message: "error in creating an audit log", cause: e });
    }
  }

  static async createAuditLog(req: Request, res: Response) {
    try {
      const auditLog = await AuditLogService.createAuditLog(req.body);
      res.status(201).json(auditLog);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "failed to create audit log", cause: e });
    }
  }

  static async;
}

/**
 * Router Requirements:
 * Create Express router that connects endpoints to controller methods
 */

// TODO: Create the router here
export const auditRouter = Router();

// TODO: Add routes here
auditRouter.post("/audit", AuditController.createAuditLog);
auditRouter.get("/:id", AuditController.getAuditLog);

// =============================================================================
// Phase 5: Integrate with User CRUD operations
// =============================================================================
/**
 * Goal: Integrate audit logging with user CRUD operations
 *
 * Requirements:
 * 1. Add audit logging to all user CRUD operations
 * 2. Track what changed in each update
 * 3. Create links between audit logs for complex operations
 * 4. Add middleware or update the user service
 *
 * This is an example of what needs to be done in the user service:
 */

// Example - User Service with Audit Integration
export class UserServiceWithAudit {
  // TODO: Update CRUD functions to add audit logging

  static async createUser(userData: any, currentUserId: Types.ObjectId) {
    try {
      // Create user
      // const newUser = await User.create(userData);

      // Log audit entry
      // await AuditLogService.logAuditEntry(...)

      throw new Error("Not implemented - integrate audit logging here");
    } catch (error) {
      throw error;
    }
  }

  static async updateUser(
    userId: Types.ObjectId,
    updateData: any,
    currentUserId: Types.ObjectId
  ) {
    try {
      // Update user
      // Fetch old data before update
      // Perform update
      // Log audit entry with changes

      throw new Error("Not implemented - integrate audit logging here");
    } catch (error) {
      throw error;
    }
  }

  // TODO: Add remaining functions (delete, etc.)
}

// =============================================================================
// Discussion Questions (to be presented at the end of the interview)
// =============================================================================
/**
 * After completing the code, we'll discuss the following questions:
 *
 * 1. Performance: How would you handle a situation with many audit logs? What optimizations would you add?
 *
 * 2. Data Integrity: How would you ensure audit logs are not lost even in case of errors?
 *
 * 3. Privacy: What considerations are there regarding storing sensitive information in audit logs?
 *
 * 4. Scalability: How would the system handle high load?
 *
 * 5. Retention Policy: How would you handle deleting old audit logs?
 *
 * 6. Real-time Monitoring: How would you add real-time tracking capabilities?
 */

// =============================================================================
// Notes for the Interviewer
// =============================================================================
/**
 * Evaluation Points:
 *
 * ✅ Ability to define correct interfaces
 * ✅ Understanding of Mongoose and MongoDB
 * ✅ Correct architecture (separation of concerns)
 * ✅ Error handling
 * ✅ Input validation
 * ✅ Understanding of REST API design
 * ✅ Ability to integrate between components
 * ✅ Thinking about performance and scalability
 * ✅ Code quality and best practices
 *
 * Success Levels:
 * 🥉 Completing phases 1-3
 * 🥈 Completing phases 1-4
 * 🥇 Completing all phases + quality discussion of questions
 */

export default {
  AuditLog,
  AuditLogService,
  AuditController,
  auditRouter,
  UserServiceWithAudit,
};
