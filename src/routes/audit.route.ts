import { Router } from "express";
import AuditController from "../controllers/audit.controller";

const router = Router();

// Get audit trail for a specific document
router.get("/trail/:documentId", AuditController.getAuditTrail);

// Get child audit logs for a parent audit log
router.get("/children/:parentId", AuditController.getChildAuditLogs);

// Create a new audit log (for testing purposes)
router.post("/", AuditController.createAuditLog);

// Create a linked audit log (demonstrates parent relationship)
router.post("/linked", AuditController.createLinkedAuditLog);

export default router;
