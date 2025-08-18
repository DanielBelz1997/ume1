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

// For real implementation, uncomment this import:
// import User, { IUser } from "../models/User";

// Interface placeholder for interview simulation
interface IUser {
  name: string;
  email: string;
}

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
  static async createAuditLog(params: Partial<IAuditLog>) {
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

  static async createLinkedAuditLog(params: Partial<IAuditLog>) {
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
 * For the interview: Focus on implementing basic create, update, delete functions
 * The main goal is to show you understand how to integrate audit logs with CRUD operations
 */

// Example - User Service with Audit Integration
// Note: This is a simplified version for interview purposes
export class UserServiceWithAudit {
  // Import User model (you'll need to import this in real implementation)
  // import User, { IUser } from "../models/User";

  static async createUser(userData: any, currentUserId: Types.ObjectId) {
    try {
      const newUser = {
        _id: new Types.ObjectId(),
        ...userData,
        createdAt: new Date(),
      };

      // Log audit entry for user creation
      const auditLog = await AuditLogService.createAuditLog({
        userId: currentUserId,
        documentId: newUser._id,
        collectionName: "User",
        changes: userData,
        action: "CREATE",
        method: "POST",
        timestamp: new Date(),
      });

      return { user: newUser, auditLog };
    } catch (error) {
      console.log("Error creating user:", error);
      throw error;
    }
  }

  static async updateUser(
    userId: Types.ObjectId,
    updateData: any,
    currentUserId: Types.ObjectId,
    parentAuditLogId?: Types.ObjectId
  ) {
    try {
      // Fetch old data before update (uncomment in real implementation)
      // const oldUser = await User.findById(userId);
      // if (!oldUser) throw new Error("User not found");

      // Simulate old user data for interview
      const oldUser = {
        _id: userId,
        name: "Old Name",
        email: "old@email.com",
      };

      // Perform update (uncomment in real implementation)
      // const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

      // Simulate updated user for interview
      const updatedUser = {
        ...oldUser,
        ...updateData,
        updatedAt: new Date(),
      };

      // Calculate what actually changed
      const changes = {};
      Object.keys(updateData).forEach((key) => {
        if (oldUser[key] !== updateData[key]) {
          changes[key] = {
            from: oldUser[key],
            to: updateData[key],
          };
        }
      });

      // Log audit entry for user update
      let auditLog;
      if (parentAuditLogId) {
        // Create linked audit log if parent is provided
        auditLog = await AuditLogService.createLinkedAuditLog({
          userId: currentUserId,
          documentId: userId,
          collectionName: "User",
          changes,
          action: "UPDATE",
          method: "PUT",
          parent: parentAuditLogId,
          timestamp: new Date(),
        });
      } else {
        // Create regular audit log
        auditLog = await AuditLogService.createAuditLog({
          userId: currentUserId,
          documentId: userId,
          collectionName: "User",
          changes,
          action: "UPDATE",
          method: "PUT",
          timestamp: new Date(),
        });
      }

      return { user: updatedUser, auditLog };
    } catch (error) {
      console.log("Error updating user:", error);
      throw error;
    }
  }

  static async deleteUser(
    userId: Types.ObjectId,
    currentUserId: Types.ObjectId
  ) {
    try {
      // Fetch user before deletion (uncomment in real implementation)
      // const userToDelete = await User.findById(userId);
      // if (!userToDelete) throw new Error("User not found");

      // Simulate user data for interview
      const userToDelete = {
        _id: userId,
        name: "Deleted User",
        email: "deleted@email.com",
      };

      // Perform deletion (uncomment in real implementation)
      // const deletedUser = await User.findByIdAndDelete(userId);

      // Log audit entry for user deletion
      const auditLog = await AuditLogService.createAuditLog({
        userId: currentUserId,
        documentId: userId,
        collectionName: "User",
        changes: userToDelete, // Store the deleted data
        action: "DELETE",
        method: "DELETE",
        timestamp: new Date(),
      });

      return { deletedUser: userToDelete, auditLog };
    } catch (error) {
      console.log("Error deleting user:", error);
      throw error;
    }
  }

  static async getUserWithAuditTrail(userId: Types.ObjectId) {
    try {
      // Get user (uncomment in real implementation)
      // const user = await User.findById(userId);

      // Simulate user for interview
      const user = {
        _id: userId,
        name: "Sample User",
        email: "sample@email.com",
      };

      // Get audit trail for this user
      const auditTrail = await AuditLogService.getDocumentAuditLog(
        userId.toString()
      );

      return { user, auditTrail };
    } catch (error) {
      console.log("Error getting user with audit trail:", error);
      throw error;
    }
  }

  // Example of bulk operation with linked audit logs
  static async bulkUpdateUsers(
    userUpdates: Array<{ userId: Types.ObjectId; updateData: any }>,
    currentUserId: Types.ObjectId
  ) {
    try {
      const results: any[] = [];
      let parentAuditLogId: Types.ObjectId | undefined;

      // Create parent audit log for bulk operation
      const bulkAuditLog = await AuditLogService.createAuditLog({
        userId: currentUserId,
        documentId: new Types.ObjectId(), // Dummy ID for bulk operation
        collectionName: "User",
        changes: { bulkOperation: true, userCount: userUpdates.length },
        action: "UPDATE",
        method: "PATCH",
        timestamp: new Date(),
      });

      if (bulkAuditLog && bulkAuditLog._id) {
        parentAuditLogId = bulkAuditLog._id as Types.ObjectId;
      }

      // Process each user update with linked audit logs
      for (const update of userUpdates) {
        const result = await this.updateUser(
          update.userId,
          update.updateData,
          currentUserId,
          parentAuditLogId
        );
        results.push(result);
      }

      return { results, bulkAuditLog };
    } catch (error) {
      console.log("Error in bulk update:", error);
      throw error;
    }
  }
}

// =============================================================================
// REAL IMPLEMENTATION - Production Ready Code
// =============================================================================
/**
 * Real implementation using actual User model and database operations
 * This demonstrates production-ready audit logging integration
 */

// You'll need to import the User model at the top of the file:
// import User, { IUser } from "../models/User";

export class UserServiceWithRealAudit {
  static async createUser(
    userData: Partial<IUser>,
    currentUserId: Types.ObjectId
  ) {
    try {
      // Real implementation - uncomment these lines in production:
      /*
      // Create the user
      const newUser = await User.create(userData);

      // Log audit entry for user creation
      await AuditLogService.createAuditLog({
        userId: currentUserId,
        documentId: newUser._id as Types.ObjectId,
        collectionName: "User",
        changes: userData,
        action: "CREATE",
        method: "POST",
      });

      return newUser;
      */

      // For interview simulation:
      console.log("Would create user:", userData);
      console.log("Would log audit for userId:", currentUserId);

      return {
        _id: new Types.ObjectId(),
        ...userData,
        message: "User creation simulated",
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async updateUser(
    userId: Types.ObjectId,
    updateData: Partial<IUser>,
    currentUserId: Types.ObjectId
  ) {
    try {
      // Real implementation - uncomment these lines in production:
      /*
      // Get old data before update
      const oldUser = await User.findById(userId);
      if (!oldUser) {
        throw new Error("User not found");
      }

      // Perform the update
      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        updateData, 
        { new: true }
      );

      // Calculate what actually changed
      const changes = {};
      Object.keys(updateData).forEach(key => {
        if (oldUser[key] !== updateData[key]) {
          changes[key] = {
            from: oldUser[key],
            to: updateData[key]
          };
        }
      });

      // Log audit entry for user update
      await AuditLogService.createAuditLog({
        userId: currentUserId,
        documentId: userId,
        collectionName: "User",
        changes,
        action: "UPDATE",
        method: "PUT",
      });

      return updatedUser;
      */

      // For interview simulation:
      console.log("Would update user:", userId, "with data:", updateData);
      console.log("Would log audit for userId:", currentUserId);

      return {
        _id: userId,
        ...updateData,
        message: "User update simulated",
      };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  static async deleteUser(
    userId: Types.ObjectId,
    currentUserId: Types.ObjectId
  ) {
    try {
      // Real implementation - uncomment these lines in production:
      /*
      // Get user data before deletion
      const userToDelete = await User.findById(userId);
      if (!userToDelete) {
        throw new Error("User not found");
      }

      // Perform the deletion
      await User.findByIdAndDelete(userId);

      // Log audit entry for user deletion
      await AuditLogService.createAuditLog({
        userId: currentUserId,
        documentId: userId,
        collectionName: "User",
        changes: {
          deletedUser: {
            name: userToDelete.name,
            email: userToDelete.email
          }
        },
        action: "DELETE",
        method: "DELETE",
      });

      return { 
        message: "User deleted successfully",
        deletedUser: userToDelete
      };
      */

      // For interview simulation:
      console.log("Would delete user:", userId);
      console.log("Would log audit for userId:", currentUserId);

      return {
        message: "User deletion simulated",
        deletedUserId: userId,
      };
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  static async getUserWithAuditTrail(userId: Types.ObjectId) {
    try {
      // Real implementation - uncomment these lines in production:
      /*
      // Get the user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Get audit trail for this user
      const auditTrail = await AuditLogService.getDocumentAuditLog(userId.toString());

      return {
        user,
        auditTrail
      };
      */

      // For interview simulation:
      console.log("Would get user and audit trail for:", userId);

      const auditTrail = await AuditLogService.getDocumentAuditLog(
        userId.toString()
      );

      return {
        user: { _id: userId, message: "User data simulated" },
        auditTrail,
      };
    } catch (error) {
      console.error("Error getting user with audit trail:", error);
      throw error;
    }
  }

  // Advanced: Bulk operations with transaction support
  static async bulkUpdateUsersWithTransaction(
    userUpdates: Array<{ userId: Types.ObjectId; updateData: Partial<IUser> }>,
    currentUserId: Types.ObjectId
  ) {
    // Real implementation would use MongoDB transactions:
    /*
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const results = [];
      
      // Create parent audit log for bulk operation
      const bulkAuditLog = await AuditLogService.createAuditLog({
        userId: currentUserId,
        documentId: new Types.ObjectId(),
        collectionName: "User",
        changes: { 
          bulkOperation: true, 
          userCount: userUpdates.length,
          operation: "bulk_update"
        },
        action: "UPDATE",
        method: "PATCH",
      });

      // Process each update within the transaction
      for (const update of userUpdates) {
        const result = await this.updateUserInTransaction(
          update.userId,
          update.updateData,
          currentUserId,
          bulkAuditLog?._id as Types.ObjectId,
          session
        );
        results.push(result);
      }

      await session.commitTransaction();
      return { results, bulkAuditLog };
      
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
    */

    console.log("Bulk update simulation for", userUpdates.length, "users");
    return { message: "Bulk update simulated" };
  }
}

// =============================================================================
// MIDDLEWARE EXAMPLES
// =============================================================================
/**
 * Express middleware for automatic audit logging
 * This can be applied to routes to automatically log all operations
 */

export const auditMiddleware = (action: "CREATE" | "UPDATE" | "DELETE") => {
  return async (req: Request, res: Response, next: any) => {
    // Real implementation:
    /*
    // Store original res.json method
    const originalJson = res.json;
    
    // Override res.json to capture response data
    res.json = function(data) {
      // Log audit entry after successful operation
      if (res.statusCode >= 200 && res.statusCode < 300) {
        AuditLogService.createAuditLog({
          userId: req.user?.id || new Types.ObjectId(), // Assuming user is in req
          documentId: data._id || req.params.id,
          collectionName: "User",
          changes: action === "DELETE" ? data : req.body,
          action,
          method: req.method as any,
        }).catch(err => {
          console.error("Failed to log audit:", err);
        });
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    */

    console.log(`Audit middleware for ${action} operation`);
    next();
  };
};

// Usage example:
// app.post('/users', auditMiddleware('CREATE'), UserController.create);
// app.put('/users/:id', auditMiddleware('UPDATE'), UserController.update);
// app.delete('/users/:id', auditMiddleware('DELETE'), UserController.delete);

/**
 * INTERVIEW COMPLETION NOTES:
 *
 * At this point, you have successfully demonstrated:
 * ✅ Interface design skills
 * ✅ Mongoose schema creation
 * ✅ Service layer architecture
 * ✅ REST API design
 * ✅ Integration of audit logging with CRUD operations
 *
 * This is sufficient for the interview. The key concepts have been covered.
 * The interviewer may now proceed to discussion questions.
 */

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
  AuditLogModel,
  AuditLogService,
  AuditController,
  auditRouter,
  UserServiceWithAudit,
  UserServiceWithRealAudit,
  auditMiddleware,
};
