import express, { Router, Request, Response, NextFunction } from "express";
import { query } from "../db";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

const server = express();
server.use(express.json());
server.listen(3000, () => console.log("Serveur prêt à démarrer"));
const router = Router();

// // Middleware pour vérifier le token JWT
// function authenticateToken(req: Request, res: Response, next: NextFunction) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ message: "Accès refusé : pas de token" });
//   }

//   jwt.verify(token, JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ message: "Token invalide ou expiré" });
//     }
//     req.body.userId = (decoded as any).userId ; // Ajoute les infos de l'utilisateur à l'objet `req`
//     next(); // Continue vers la route suivante
//   });
// }

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
  const { email, password,} = req.body;

  console.log("Requête POST reçue sur /login");
  console.log("Données reçues :", req.body);
 
 

  try {
    // Requête SQL pour vérifier si l'utilisateur existe et si le mot de passe correspond
    const result = await query(
      'SELECT * FROM users WHERE AdresseMailUser = ? AND MdpUser = ?',
      [email, password]
    );

    if (result.length > 0) {
      const user = result[0];
      const jwtSecret = process.env.JWT_SECRET;

      const token = jwt.sign({userId: user.IdUser, email:user.AdresseMailUser},
        jwtSecret,
        {expiresIn: '1h',
      });
      // Si l'utilisateur est trouvé, répondre avec un succès
      res.status(200).json({
        message: "Connexion réussie",
        user: result[0], // retourner les infos de l'utilisateur
        token
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

server.get('/tache', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId; // Accès à req.user
    if (!userId) {
      return res.status(400).json({ message: 'Utilisateur non identifié' });
    }

    const tasks = await query('SELECT * FROM tache WHERE IdUser = ?', [userId]);
    res.json(tasks);
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}); 

// query('').then(value => console.log(value))


