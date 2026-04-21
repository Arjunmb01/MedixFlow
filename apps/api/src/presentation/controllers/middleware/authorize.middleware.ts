import { Request, Response, NextFunction } from "express";
import { UserRole } from "@/domain/value-objects/enums/UserRole";

export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.log("[AuthorizeMiddleware] No user found on request object");
      return res.status(401).json({ message: "Authentication required" });
    }

    const userRole = (req.user?.role || "").toUpperCase();
    const uppercaseRoles = roles.map(r => r.toUpperCase());

    console.log(`[AuthorizeMiddleware] Checking access. User Role: "${userRole}", Allowed Roles: [${uppercaseRoles.join(", ")}]`);

    if (!uppercaseRoles.includes(userRole)) {
      console.warn(`[AuthorizeMiddleware] ACCESS DENIED: Role "${userRole}" not in allowed list [${uppercaseRoles.join(", ")}]`);
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }



    next();
  };
};
