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

utilisateurRouter.get("/utilisateur/getListes/:IdCategorie", async (req: Request, res: Response) => {
    try {
      console.log("Récupération des associations...");
      const listes = await query("SELECT c.IdCategorie, c.NomCategorie, l.NomListe, l.IdListe FROM categorie c LEFT JOIN liste l ON l.IdCategorie = c.IdCategorie WHERE c.IdCategorie = ?", [req.params.IdCategorie]);
      console.log("Associations récupérées:", listes);
      res.json(listes);
    } catch (error) {
      console.error("Erreur :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  utilisateurRouter.get("/utilisateur/getTaches/:IdListe", async (req: Request, res: Response) => {
    try {
      console.log("Récupération des associations...");
      const taches = await query("SELECT l.NomListe, l.IdListe, t.* FROM liste l LEFT JOIN tache t ON l.IdListe = t.IdListe WHERE l.IdListe = ?", [req.params.IdListe]);
      console.log("Associations récupérées:", taches);
      res.json(taches);
    } catch (error) {
      console.error("Erreur :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  utilisateurRouter.delete(
    "/utilisateur/tache/delete/:id",
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

  utilisateurRouter.post("/utilisateur/tache/save", async (req: Request, res: Response) => {
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

  utilisateurRouter.post("/utilisateur/tache/add", async (req, res) => {
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

  utilisateurRouter.post("/utilisateur/listes/add/:IdCategorie", async (req, res) => {
    const IdCategorie = req.params.IdCategorie;
    const { NomListe } =
      req.body;
      const IdUser = getUserIdFromToken(req);
      const listePerso = 0;
  console.log("body :", req.body)
  console.log("IdCategorie :", IdCategorie)
   
    const creationDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    try {
  
      const result = await query(
        "INSERT INTO liste (NomListe, datecreaListe, listePerso, IdCategorie, IdUser_createurListe) VALUES (?,?,?,?,?)",
            [NomListe, creationDate, listePerso, IdCategorie, IdUser]
      );
  
      if (result && (result as any).insertId) {
        const insertId = (result as any).insertId;
        res.status(201).json({message: "Liste ajouté avec succès.", IdListe: insertId,
        });
      } else {
        res.status(500).json({ error: "Échec de l'ajout de la liste." });
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la liste:", error);
      res.status(500).json({ error: "Erreur lors de l'ajout de la liste." });
    }
  });

export default utilisateurRouter;