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

    if (result && (result as any).insertId) {
      const insertId = (result as any).insertId;
      res.status(201).json({message: "Utilisateur ajouté avec succès.", userId: insertId,
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
  console.log("Données reçues:", req.body);
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
    console.log('Mise à jour des utilisateurs :', updateUsers);
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

usersRouter.delete("/users/delete/:id", async (req: Request, res: Response) => {
  const userId = req.params.id;

  // Validate that the ID is a number
  if (isNaN(Number(userId))) {
    return res.status(400).json({ error: "ID utilisateur invalide" });
  }

  try {
    // First, check if the user exists
    const existingUser = await query("SELECT * FROM users WHERE IdUser = ?", [userId]);

    if (existingUser.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Perform the deletion
    const result = await query("DELETE FROM users WHERE IdUser = ?", [userId]);

    // Check if the deletion was successful
    if (result && (result as any).affectedRows > 0) {
      res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } else {
      res.status(500).json({ error: "Impossible de supprimer l'utilisateur" });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
  }
});

export default usersRouter;
