import { Request, Response, NextFunction } from "express";

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.log("[AuthorizeMiddleware] No user found on request object");
      return res.status(401).json({ message: "Authentication required" });
    }

    const userRole = req.user.role.toUpperCase();
    const uppercaseRoles = roles.map(r => r.toUpperCase());

    if (!uppercaseRoles.includes(userRole)) {
      console.log("[AuthorizeMiddleware] Access Denied for role:", userRole);
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }



    next();
  };
};
