import { Schema, model, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
  action: "CREATE" | "UPDATE" | "DELETE";
  collectionName: string;
  documentId: Types.ObjectId;
  timestamp: Date;
  userId?: Types.ObjectId;
  changes: any;
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: {
    type: String,
    enum: ["CREATE", "UPDATE", "DELETE"],
    required: true,
  },
  collectionName: {
    type: String,
    required: true,
  },
  documentId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now(),
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  changes: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

export default model<IAuditLog>("AuditLog", AuditLogSchema);
