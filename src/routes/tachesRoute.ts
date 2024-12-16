import { query } from "../../db";
import express, { Request, Response } from "express";

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

tachesRouter.get('/api/admin/tache/add', (req, res) => {
    res.status(405).json({ error: 'Méthode non autorisée.' });
  });

  
tachesRouter.post("/tache/add", async (req, res) => {
  const { NomTache, EcheanceTache} =
    req.body;
console.log(req.body)
 
  const creationDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  try {

    const result = await query(
      "INSERT INTO tache (NomTache, EcheanceTache, datecreaTache) VALUES (?, ?,?)",
      [NomTache,EcheanceTache,creationDate]
    );

    if (result && (result as any).insertId) {
      const insertId = (result as any).insertId;
      res.status(201).json({message: "Tache ajouté avec succès.", IdTache: insertId,
      });
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
  }[] = req.body;

  const majDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (!Array.isArray(updateTache)) {
    return res
      .status(400)
      .json({ error: "Données invalides. Un tableau est attendu." });
  }

  try {
    console.log('Mise à jour des taches :', updateTache);
    for (const tache of updateTache) {
      if (!tache.IdTache) {
        return res.status(400).json({ error: "ID tache manquant" });
      }

      await query(
        "UPDATE tache SET NomTache = ?, EcheanceTache = ?, EtatTache = ?, datemajTache = ? WHERE IdTache = ?",
        [
          tache.NomTache,
          tache.EcheanceTache,
          tache.EtatTache,
          majDate,
          tache.IdTache          
        ]
      );
    }
    res.status(200).json({ message: "Données sauvegardées avec succès !" });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde :", error);
    res.status(500).json({ error: "Erreur lors de la sauvegarde des données" });
  }
});

tachesRouter.put('/api/taches/:id', async (req, res) => {
  try {
    const IdTache = req.params.id;
    const { NomTache, EcheanceTache, EtatTache } = req.body;
    
    await query(`
      UPDATE tache SET NomTache = ?, EcheanceTache = ?, EtatTache = ?, datemajTache = NOW() WHERE IdTache = ? `, [NomTache, EcheanceTache, EtatTache ? 1 : 0, IdTache]);
    
    const [updatedTask] = await query(
      'SELECT * FROM tache WHERE IdTache = ?',
      [IdTache]
    );
    
    if (updatedTask.length === 0) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }
    
    res.json(updatedTask[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    res.status(500).json({ error: "Erreur lors de la sauvegarde des données" 
    });
  }
});

tachesRouter.delete("/tache/delete/:id", async (req: Request, res: Response) => {
  const IdTache = req.params.id;

  // Validate that the ID is a number
  if (isNaN(Number(IdTache))) {
    return res.status(400).json({ error: "ID tache invalide" });
  }

  try {
    // First, check if the user exists
    const existingTache = await query("SELECT * FROM tache WHERE IdTache = ?", [IdTache]);

    if (existingTache.length === 0) {
      return res.status(404).json({ error: "Tache non trouvé" });
    }

    // Perform the deletion
    const result = await query("DELETE FROM tache WHERE IdTache = ?", [IdTache]);

    // Check if the deletion was successful
    if (result && (result as any).affectedRows > 0) {
      res.status(200).json({ message: "Tache supprimé avec succès" });
    } else {
      res.status(500).json({ error: "Impossible de supprimer la tache" });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de la tache:", error);
    res.status(500).json({ error: "Erreur lors de la suppression de la tache" });
  }
});

export default tachesRouter;
