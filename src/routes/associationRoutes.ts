import { query } from "../../db";
import express, { Request, Response } from "express";

const assocRouter = express();

assocRouter.get("/association/get", async (req: Request, res: Response) => {
  try {
    console.log("Récupération des associations...");
    const associations = await query("SELECT c.IdCategorie, c.NomCategorie, GROUP_CONCAT(u.NomUser) AS NomUser FROM categorie c LEFT JOIN associer a ON a.IdCategorie = c.IdCategorie LEFT JOIN users u ON a.IdUser = u.IdUser GROUP BY c.IdCategorie, c.NomCategorie");
    console.log("Associations récupérées:", associations);
    res.json(associations);
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

assocRouter.get("/association/get/:IdCategorie", async (req: Request, res: Response) => {
    try {
      console.log("Récupération des associations...");
      const associations = await query("SELECT c.IdCategorie, c.NomCategorie, u.IdUser, u.NomUser FROM categorie c LEFT JOIN associer a ON a.IdCategorie = c.IdCategorie LEFT JOIN users u ON a.IdUser = u.IdUser WHERE c.IdCategorie = ?", [req.params.IdCategorie]);
      console.log("Associations récupérées:", associations);
      res.json(associations);
    } catch (error) {
      console.error("Erreur :", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

assocRouter.post("/association/add", async (req, res) => {
  const { IdUser, IdCategorie } = req.body;
  console.log(req.body);
  try {
    const result = await query(
      "INSERT INTO associer (IdUser, IdCategorie) VALUES (?, ?)",
      [IdUser, IdCategorie]
    );

    if (result && (result as any).insertId) {
      const insertId = (result as any).insertId;
      res.status(201).json({
        message: "Association ajoutée avec succès.",
        IdAssociation: insertId,
      });
    } else {
      res.status(500).json({ error: "Échec de l'ajout de l'association." });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'association:", error);
    res.status(500).json({ error: "Erreur lors de l'ajout de l'association." });
  }
});

export default assocRouter;