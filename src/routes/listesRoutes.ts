import { query } from "../../db";
import express, { Request, Response } from "express";

const listeRouter = express();

listeRouter.get("/listes/get", async (req: Request, res: Response) => {
  try {
    console.log("Récupération des tâches...");
    const listes = await query("SELECT * FROM liste");
    console.log("Listes récupérées:", listes);
    res.json(listes);
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

listeRouter.get('/api/admin/listes/add', (req, res) => {
    res.status(405).json({ error: 'Méthode non autorisée.' });
  });

  
listeRouter.post("/listes/add", async (req, res) => {
  const { NomListe} =
    req.body;
console.log(req.body)
 
  const creationDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  try {

    const result = await query(
      "INSERT INTO liste (NomListe, datecreaListe) VALUES (?,?)",
      [NomListe,creationDate]
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

listeRouter.post("/listes/save", async (req: Request, res: Response) => {
  console.log("Données reçues:", req.body);
  const updateListe: {
    IdListe: number;
    NomListe: string;
    listeArchive: boolean;
  }[] = req.body;
console.log("qfswdfsq",req.body)
  const majDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (!Array.isArray(updateListe)) {
    return res
      .status(400)
      .json({ error: "Données invalides. Un tableau est attendu." });
  }

  try {
    console.log('Mise à jour des listes :', updateListe);
    for (const liste of updateListe) {
      if (!liste.IdListe) {
        return res.status(400).json({ error: "ID liste manquant" });
      }

      await query(
        "UPDATE liste SET NomListe = ?, listeArchive = ?, dateMajListe = ? WHERE IdListe = ?",
        [
          liste.NomListe,
          liste.listeArchive,
          majDate,
          liste.IdListe         
        ]
      );
    }
    res.status(200).json({ message: "Données sauvegardées avec succès !" });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde :", error);
    res.status(500).json({ error: "Erreur lors de la sauvegarde des données" });
  }
});

listeRouter.put('/api/listes/:id', async (req, res) => {
  try {
    const IdListe = req.params.id;
    const { NomListe, listeArchivage } = req.body;
    
    await query(`
      UPDATE tache SET NomListe = ?, listeArchivage = ?, dateMajListe = NOW() WHERE IdListe = ? `, [NomListe, listeArchivage ? 1 : 0, IdListe]);
    
    const [updatedListe] = await query(
      'SELECT * FROM liste WHERE IdListe = ?',
      [IdListe]
    );
    
    if (updatedListe.length === 0) {
      return res.status(404).json({ message: "Liste non trouvée" });
    }
    
    res.json(updatedListe[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la liste:', error);
    res.status(500).json({ error: "Erreur lors de la sauvegarde des données" 
    });
  }
});

listeRouter.delete("/listes/delete/:id", async (req: Request, res: Response) => {
  const IdListe = req.params.id;

  // Validate that the ID is a number
  if (isNaN(Number(IdListe))) {
    return res.status(400).json({ error: "ID liste invalide" });
  }

  try {
    // First, check if the user exists
    const existingListe = await query("SELECT * FROM liste WHERE IdListe = ?", [IdListe]);

    if (existingListe.length === 0) {
      return res.status(404).json({ error: "Liste non trouvé" });
    }

    // Perform the deletion
    const result = await query("DELETE FROM liste WHERE IdListe = ?", [IdListe]);

    // Check if the deletion was successful
    if (result && (result as any).affectedRows > 0) {
      res.status(200).json({ message: "Liste supprimé avec succès" });
    } else {
      res.status(500).json({ error: "Impossible de supprimer la liste" });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de la liste:", error);
    res.status(500).json({ error: "Erreur lors de la suppression de la liste" });
  }
});

export default listeRouter;
