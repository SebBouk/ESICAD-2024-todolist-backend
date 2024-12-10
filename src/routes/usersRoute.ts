import { query } from "../../db";
import express, { Request, Response } from "express";

const usersRouter = express();

usersRouter.get("/users/get", async (req: Request, res: Response) => {
  try {
    const users = await query("SELECT * FROM users");
    res.json(users);
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

usersRouter.get('/api/admin/users/add', (req, res) => {
    res.status(405).json({ error: 'Méthode non autorisée.' });
  });

usersRouter.post("/users/add", async (req, res) => {
  const { NomUser, PrenomUser, AdresseMailUser, AdminUser, ActifUser } =
    req.body;

  // Validation simple des données
  if (!NomUser || !PrenomUser || !AdresseMailUser) {
    return res.status(400).json({ error: "Nom, prénom et mail sont requis." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(AdresseMailUser)) {
    return res.status(400).json({ error: "Format d'email invalide." });
  }
  try {
    // Check if email already exists
    const existingUser = await query(
      "SELECT * FROM users WHERE AdresseMailUser = ?",
      [AdresseMailUser]
    );

    if (existingUser.length > 0) {
      return res
        .status(409)
        .json({ error: "Un utilisateur avec cet email existe déjà." });
    }
    const result = await query(
      "INSERT INTO users (NomUser, PrenomUser, AdresseMailUser, AdminUser, ActifUser) VALUES (?, ?, ?, ?, ?)",
      [NomUser, PrenomUser, AdresseMailUser, AdminUser, ActifUser]
    );

    if (result && result.length > 0) {
      const insertId = (result as any).insertId;
      res.status(201).json({
        message: "Utilisateur ajouté avec succès.",
        userId: insertId,
      });
    } else {
      res.status(500).json({ error: "Échec de l'ajout de l'utilisateur." });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur:", error);
    res.status(500).json({ error: "Erreur lors de l'ajout de l'utilisateur." });
  }
});

usersRouter.post("/users/save", async (req: Request, res: Response) => {
  const updateUsers: {
    IdUser: number;
    NomUser: string;
    PrenomUser: string;
    AdresseMailUser: string;
    AdminUser: boolean;
    ActifUser: boolean;
  }[] = req.body;

  if (!Array.isArray(updateUsers)) {
    return res
      .status(400)
      .json({ error: "Données invalides. Un tableau est attendu." });
  }

  try {
    for (const user of updateUsers) {
      if (!user.IdUser) {
        return res.status(400).json({ error: "ID utilisateur manquant" });
      }

      await query(
        "UPDATE users SET NomUser = ?, PrenomUser = ?, AdresseMailUser = ?, AdminUser = ?, ActifUser = ? WHERE IdUser = ?",
        [
          user.NomUser,
          user.PrenomUser,
          user.AdresseMailUser,
          user.AdminUser,
          user.ActifUser,
          user.IdUser,
        ]
      );
    }
    res.status(200).json({ message: "Données sauvegardées avec succès !" });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde :", error);
    res.status(500).json({ error: "Erreur lors de la sauvegarde des données" });
  }
});

export default usersRouter;
