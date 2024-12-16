import { query } from "../../db";
import express, { Request, Response } from "express";

const categoriesRouter = express();

categoriesRouter.get("/categories/get", async (req: Request, res: Response) => {
  try {
    console.log("Récupération des tâches...");
    const categories = await query("SELECT * FROM categorie");
    console.log("Categories récupérées:", categories);
    res.json(categories);
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

categoriesRouter.get('/api/admin/categories/add', (req, res) => {
    res.status(405).json({ error: 'Méthode non autorisée.' });
  });

  
categoriesRouter.post("/categories/add", async (req, res) => {
  const { NomCategorie} =
    req.body;
console.log(req.body)
 
  
  try {

    const result = await query(
      "INSERT INTO categorie (NomCategorie) VALUES (?)",
      [NomCategorie]
    );

    if (result && (result as any).insertId) {
      const insertId = (result as any).insertId;
      res.status(201).json({message: "Categorie ajouté avec succès.", IdCategorie: insertId,
      });
    } else {
      res.status(500).json({ error: "Échec de l'ajout de la categorie." });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de la categorie:", error);
    res.status(500).json({ error: "Erreur lors de l'ajout de la categorie." });
  }
});

categoriesRouter.post("/categories/save", async (req: Request, res: Response) => {
  console.log("Données reçues:", req.body);
  const updateCategorie: {
    IdCategorie: number;
    NomCategorie: string;
  }[] = req.body;


  if (!Array.isArray(updateCategorie)) {
    return res
      .status(400)
      .json({ error: "Données invalides. Un tableau est attendu." });
  }

  try {
    console.log('Mise à jour des categories :', updateCategorie);
    for (const categorie of updateCategorie) {
      if (!categorie.IdCategorie) {
        return res.status(400).json({ error: "ID categorie manquant" });
      }

      await query(
        "UPDATE categorie SET NomCategorie = ? WHERE IdCategorie = ?",
        [
          categorie.NomCategorie,
          categorie.IdCategorie        
        ]
      );
    }
    res.status(200).json({ message: "Données sauvegardées avec succès !" });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde :", error);
    res.status(500).json({ error: "Erreur lors de la sauvegarde des données" });
  }
});

categoriesRouter.put('/api/categories/:id', async (req, res) => {
  try {
    const IdCategorie = req.params.id;
    const { NomCategorie } = req.body;
    
    await query(`
      UPDATE categorie SET NomCategorie = ? WHERE IdCategorie = ? `, [NomCategorie, IdCategorie]);
    
    const [updatedCategorie] = await query(
      'SELECT * FROM categorie WHERE IdCatefories = ?',
      [IdCategorie]
    );
    
    if (updatedCategorie.length === 0) {
      return res.status(404).json({ message: "Categorie non trouvée" });
    }
    
    res.json(updatedCategorie[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la categories:', error);
    res.status(500).json({ error: "Erreur lors de la sauvegarde des données" 
    });
  }
});

categoriesRouter.delete("/categories/delete/:id", async (req: Request, res: Response) => {
  const IdCategorie = req.params.id;

  // Validate that the ID is a number
  if (isNaN(Number(IdCategorie))) {
    return res.status(400).json({ error: "ID categorie invalide" });
  }

  try {
    // First, check if the user exists
    const existingCategorie = await query("SELECT * FROM categorie WHERE IdCategorie = ?", [IdCategorie]);

    if (existingCategorie.length === 0) {
      return res.status(404).json({ error: "Categories non trouvé" });
    }

    // Perform the deletion
    const result = await query("DELETE FROM categorie WHERE IdCategorie = ?", [IdCategorie]);

    // Check if the deletion was successful
    if (result && (result as any).affectedRows > 0) {
      res.status(200).json({ message: "Catégorie supprimé avec succès" });
    } else {
      res.status(500).json({ error: "Impossible de supprimer la catégorie" });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    res.status(500).json({ error: "Erreur lors de la suppression de la catégorie" });
  }
});

export default categoriesRouter;
