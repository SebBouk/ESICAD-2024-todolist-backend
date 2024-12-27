import { query } from "../../db";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken"; // Si vous utilisez JWT pour l'authentification

const utilisateurRouter = express(); 

const getUserIdFromToken = (req: Request): number | null => {
  const token = req.cookies['token']; // Le token est supposé être dans le cookie "token"

  if (!token) {
    throw new Error("Token non trouvé");
  }

  try {
    // Vérifier et décoder le token JWT
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!); // Remplacez par votre secret JWT
    return decoded.IdUser; // Récupérer l'ID utilisateur depuis le payload du token
  } catch (error) {
    throw new Error("Token invalide ou expiré");
  }
};

utilisateurRouter.get("/utilisateur/getCategorie/:IdUser", async (req: Request, res: Response) => {
  try {
    const IdUser  = req.params.IdUser;
    const UsCat = await query("SELECT c.IdCategorie, c.NomCategorie FROM categorie c JOIN associer a ON c.IdCategorie = a.IdCategorie WHERE a.IdUser = ?", [IdUser]);
    res.json(UsCat);
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default utilisateurRouter;