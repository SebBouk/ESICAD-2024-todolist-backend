import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "./authMiddleware";

export const actifMiddleware = (actif: number) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (req.user) {
      if (req.user.ActifUser === actif) {
        return next(); 
      } else {
        return res.status(403).json({ message: "Accès refusé : compte non actif." });
      }
    }
    return res.status(401).json({ message: "Accès non autorisé : utilisateur non authentifié." });
  };
};
