import { query } from "../../db";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken"; // Si vous utilisez JWT pour l'authentification

const getUserIdFromToken = (req: Request): number | null => {
  const token = req.cookies["token"]; // Le token est supposé être dans le cookie "token"

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

const tachesRouter = express();

tachesRouter.get("/tache/get", async (req: Request, res: Response) => {
  try {
    console.log("Récupération des tâches...");
    const taches = await query("SELECT * FROM tache");
    console.log("Tâches récupérées:", taches);
    res.json(taches);
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

tachesRouter.get("/api/admin/tache/add", (req, res) => {
  res.status(405).json({ error: "Méthode non autorisée." });
});

tachesRouter.post("/tache/add", async (req, res) => {
  const { NomTache, EcheanceTache, IdListe } = req.body;
  const IdUser = getUserIdFromToken(req);
  console.log(req.body);

  const creationDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  try {
    const result = await query(
      "INSERT INTO tache (NomTache, EcheanceTache, datecreaTache, IdUser_createurTache, IdListe) VALUES (?,?,?,?,?)",
      [NomTache, EcheanceTache, creationDate,IdUser, IdListe]
    );

    if (result && (result as any).insertId) {
      const insertId = (result as any).insertId;
      res
        .status(201)
        .json({ message: "Tache ajouté avec succès.", IdTache: insertId });
    } else {
      res.status(500).json({ error: "Échec de l'ajout de la tache." });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de la tache:", error);
    res.status(500).json({ error: "Erreur lors de l'ajout de la tache." });
  }
});

tachesRouter.post("/tache/save", async (req: Request, res: Response) => {
  console.log("Données reçues:", req.body);
  const updateTache: {
    IdTache: number;
    NomTache: string;
    EcheanceTache: Date;
    EtatTache: boolean;
    IdListe: number;
  }[] = req.body;

  const majDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  const IdUser = getUserIdFromToken(req);

  if (!Array.isArray(updateTache)) {
    return res
      .status(400)
      .json({ error: "Données invalides. Un tableau est attendu." });
  }

  try {
    console.log("Mise à jour des taches :", updateTache);
    for (const tache of updateTache) {
      if (!tache.IdTache) {
        return res.status(400).json({ error: "ID tache manquant" });
      }

      const [currentTache] = await query(
        "SELECT EtatTache, dateEtatTache, IdUser_termineTache FROM tache WHERE IdTache = ?",
        [tache.IdTache]
      );

      if (!currentTache) {
        return res.status(404).json({ error: "Liste introuvable" });
      }

      // Si la liste est passée de non archivée à archivée, on met à jour la date d'archivage
      const dateEtatTache =
        tache.EtatTache && !currentTache.EtatTache
          ? majDate
          : currentTache.dateEtatTache;
          const IdUser_termineTache =
          tache.EtatTache && !currentTache.EtatTache
            ? IdUser // Utilise l'utilisateur connecté
            : currentTache.IdUser_termineTache || null; // Par défaut, conserver la valeur existante
        

      await query(
        "UPDATE tache SET NomTache = ?, EcheanceTache = ?, EtatTache = ?, datemajTache = ?, dateEtatTache = ?, IdUser_termineTache = ?, IdUser_modifieTache = ?, IdListe = ? WHERE IdTache = ?",
        [
          tache.NomTache,
          tache.EcheanceTache,
          tache.EtatTache,
          majDate,
          dateEtatTache,
          IdUser_termineTache,
          IdUser,
          tache.IdListe,
          tache.IdTache,
        ]
      );
    }
    res.status(200).json({ message: "Données sauvegardées avec succès !" });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde :", error);
    res.status(500).json({ error: "Erreur lors de la sauvegarde des données" });
  }
});

tachesRouter.put("/api/taches/:id", async (req, res) => {
  try {
    const IdTache = req.params.id;
    const { NomTache, EcheanceTache, EtatTache } = req.body;

    await query(
      `
      UPDATE tache SET NomTache = ?, EcheanceTache = ?, EtatTache = ?, datemajTache = NOW() WHERE IdTache = ? `,
      [NomTache, EcheanceTache, EtatTache ? 1 : 0, IdTache]
    );

    const [updatedTask] = await query("SELECT * FROM tache WHERE IdTache = ?", [
      IdTache,
    ]);

    if (updatedTask.length === 0) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }

    res.json(updatedTask[0]);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la tâche:", error);
    res.status(500).json({ error: "Erreur lors de la sauvegarde des données" });
  }
});

tachesRouter.delete(
  "/tache/delete/:id",
  async (req: Request, res: Response) => {
    const IdTache = req.params.id;

    // Validate that the ID is a number
    if (isNaN(Number(IdTache))) {
      return res.status(400).json({ error: "ID tache invalide" });
    }

    try {
      // First, check if the user exists
      const existingTache = await query(
        "SELECT * FROM tache WHERE IdTache = ?",
        [IdTache]
      );

      if (existingTache.length === 0) {
        return res.status(404).json({ error: "Tache non trouvé" });
      }

      // Perform the deletion
      const result = await query("DELETE FROM tache WHERE IdTache = ?", [
        IdTache,
      ]);

      // Check if the deletion was successful
      if (result && (result as any).affectedRows > 0) {
        res.status(200).json({ message: "Tache supprimé avec succès" });
      } else {
        res.status(500).json({ error: "Impossible de supprimer la tache" });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la tache:", error);
      res
        .status(500)
        .json({ error: "Erreur lors de la suppression de la tache" });
    }
  }
);

export default tachesRouter;
