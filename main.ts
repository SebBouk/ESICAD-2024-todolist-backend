import express, { Request, Response } from "express";
import { query } from "./db";

const server = express();
server.use(express.json());
server.listen(3000, () => console.log("Serveur prêt à démarrer"));

// Route pour récupérer tous les utilisateurs
server.get("/users", async (req: Request, res: Response) => {
  try {
    // récupérer tous les utilisateurs du SGBD
    const users = await query("SELECT * FROM users");
    res.json(users);
  } catch (error) {
    console.error("Erreur :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

server.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  console.log("Requête POST reçue sur /login");
  console.log("Données reçues :", req.body);

  try {
    // Requête SQL pour vérifier si l'utilisateur existe et si le mot de passe correspond
    const result = await query(
      'SELECT * FROM users WHERE AdresseMailUser = ? AND MdpUser = ?',
      [email, password]
    );

    if (result.length > 0) {
      // Si l'utilisateur est trouvé, répondre avec un succès
      res.status(200).json({
        message: "Connexion réussie",
        user: result[0], // retourner les infos de l'utilisateur
      });
    } else {
      // Sinon, renvoyer une erreur
      res.status(401).json({
        message: "Identifiants incorrects",
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'authentification :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }

});

// query('').then(value => console.log(value))



