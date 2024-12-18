import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "./authMiddleware";

export const roleMiddleware = (role: number) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (req.user) {
      if (req.user.AdminUser === role) {
        return next(); 
      } else {
        return res.status(403).json({ message: "Accès refusé : rôle non autorisé." });
      }
    }
    return res.status(401).json({ message: "Accès non autorisé : utilisateur non authentifié." });
  };
};
