import { Types } from "mongoose";
import AuditLogService from "./services/audit.service";
import UserService from "./services/users.service";

/**
 * Example demonstrating how the parent relationship works in audit logs
 * This shows the interview scenario where audit logs can be linked to each other
 */

async function demonstrateParentRelationship() {
  console.log("=== Audit Log Parent Relationship Demo ===\n");

  // Simulated user IDs (in real app, these would come from authentication)
  const adminUserId = new Types.ObjectId();
  const documentId = new Types.ObjectId();

  try {
    console.log("1. Creating initial audit log (User creation)...");
    const initialLog = await AuditLogService.logAuditEntry(
      "CREATE",
      "User",
      documentId,
      { name: "John Doe", email: "john@example.com" },
      adminUserId,
      "POST"
    );

    if (!initialLog) {
      console.log("Failed to create initial log");
      return;
    }

    console.log(`   ✓ Created audit log ID: ${initialLog._id}`);
    console.log(`   ✓ Type: ${initialLog.type}, Method: ${initialLog.method}`);
    console.log(`   ✓ No parent (this is the root log)\n`);

    console.log("2. Creating linked audit log (User update)...");
    const updateLog = await AuditLogService.logLinkedAuditEntry(
      "UPDATE",
      "User",
      documentId,
      { name: "John Smith" }, // Name change
      adminUserId,
      initialLog._id as Types.ObjectId,
      "PUT"
    );

    if (!updateLog) {
      console.log("Failed to create update log");
      return;
    }

    console.log(`   ✓ Created linked audit log ID: ${updateLog._id}`);
    console.log(`   ✓ Type: ${updateLog.type}, Method: ${updateLog.method}`);
    console.log(`   ✓ Parent: ${updateLog.parent} (links to initial log)\n`);

    console.log("3. Creating another linked audit log (Another update)...");
    const secondUpdateLog = await AuditLogService.logLinkedAuditEntry(
      "UPDATE",
      "User",
      documentId,
      { email: "johnsmith@example.com" }, // Email change
      adminUserId,
      updateLog._id as Types.ObjectId,
      "PATCH"
    );

    if (!secondUpdateLog) {
      console.log("Failed to create second update log");
      return;
    }

    console.log(
      `   ✓ Created second linked audit log ID: ${secondUpdateLog._id}`
    );
    console.log(
      `   ✓ Type: ${secondUpdateLog.type}, Method: ${secondUpdateLog.method}`
    );
    console.log(
      `   ✓ Parent: ${secondUpdateLog.parent} (links to first update log)\n`
    );

    console.log("4. Getting full audit trail for document...");
    const auditTrail = await AuditLogService.getAuditTrail(documentId);

    console.log(`   ✓ Found ${auditTrail.length} audit log entries:`);
    auditTrail.forEach((log, index) => {
      console.log(
        `   ${index + 1}. ${log.type} (${log.method}) - ${log.timestamp}`
      );
      console.log(`      Parent: ${log.parent || "None"}`);
    });

    console.log("\n5. Getting child logs for initial log...");
    const childLogs = await AuditLogService.getChildAuditLogs(
      initialLog._id as Types.ObjectId
    );

    console.log(
      `   ✓ Found ${childLogs.length} direct child log(s) for initial log:`
    );
    childLogs.forEach((log, index) => {
      console.log(
        `   ${index + 1}. ${log.type} (${log.method}) - Parent: ${log.parent}`
      );
    });

    console.log("\n=== Demo Complete ===");
    console.log("\nThis demonstrates how audit logs can be linked:");
    console.log("• Initial CREATE operation → No parent");
    console.log("• First UPDATE operation → Parent = CREATE log ID");
    console.log("• Second UPDATE operation → Parent = First UPDATE log ID");
    console.log("• This creates a chain of related operations");
  } catch (error) {
    console.error("Error in demo:", error);
  }
}

// Export for testing
export { demonstrateParentRelationship };

// Example of how the interview scenario might look:
// 1. Interviewer asks you to define the interface with userId, type, method, parent
// 2. They ask you to explain how parent relationship works
// 3. They might ask you to implement a simple service method
// 4. They ask you to create a basic controller

console.log(`
Interview Practice Notes:
========================

1. Interface Definition (Key Fields Expected):
   - userId: Types.ObjectId (required)
   - type: "CREATE" | "UPDATE" | "DELETE" (required) 
   - method: HTTP method like "POST", "PUT", etc. (optional)
   - parent: Types.ObjectId (optional - references another AuditLog)

2. Parent Relationship Explanation:
   - Allows linking related audit operations
   - Example: User update → references the creation audit log as parent
   - Creates audit trail chains for complex operations

3. Service Methods (Keep Simple):
   - logAuditEntry() - main method to create audit logs
   - logLinkedAuditEntry() - create audit log with parent reference
   - getAuditTrail() - get all logs for a document
   - getChildAuditLogs() - get logs that reference a parent

4. Controller (Basic CRUD):
   - GET /audit/trail/:documentId - get audit trail
   - POST /audit - create new audit log
   - POST /audit/linked - create linked audit log

Remember: Start with the interface, explain the parent concept, then implement simply!
`);
