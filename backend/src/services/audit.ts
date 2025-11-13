import AuditLog from "../models/AuditLog";

export const logAction = async (
  userId: string | undefined,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  req?: any,
) => {
  const auditLog = new AuditLog({
    userId,
    action,
    resource,
    resourceId,
    details,
    ipAddress: req?.ip,
    userAgent: req?.get("User-Agent"),
  });

  await auditLog.save();
};
