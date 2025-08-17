import { Schema, model, Document, Types } from "mongoose";

// Interview-style AuditLog interface - focuses on the key fields expected
export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  type: "CREATE" | "UPDATE" | "DELETE";
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  parent?: Types.ObjectId; // Reference to another AuditLog for linked operations
  timestamp: Date;
  // Additional fields for more complete audit trail
  documentId: Types.ObjectId;
  collectionName: string;
  changes: any;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["CREATE", "UPDATE", "DELETE"],
    required: true,
  },
  method: {
    type: String,
    enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    required: false,
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: "AuditLog",
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
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
});

export default model<IAuditLog>("AuditLog", AuditLogSchema);
