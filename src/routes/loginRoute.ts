import express, { Request, Response } from "express";
import { query } from "../../db";
import jwt from "jsonwebtoken";
import { CustomRequest } from "../../middlewares/authMiddleware";
import bcrypt from "bcrypt";

const LoginRouter = express();

LoginRouter.post("/login", async (req: Request, res: Response) => {
  const { AdresseMailUser, MdpUser } = req.body;

  console.log("Requête POST reçue sur /login");
  console.log("Données reçues :", req.body);

  try {
      // Effectuer la requête pour récupérer l'employé par email
      const result = await query(
          'SELECT * FROM users WHERE AdresseMailUser = ?',
          [AdresseMailUser]
      );
      const user = result[0];

      // Vérifier si l'employé existe
      if (!user) {
          return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Comparer le mot de passe avec le hash stocké en base de données
      const match = await bcrypt.compare(MdpUser, user.MdpUser);

      if (!match) {
          return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Générer un token JWT si l'authentification réussit
      const token = jwt.sign(
          {
              IdUser: user.IdUser,
              AdresseMailUser: user.AdminUser,
              AdminUser: user.AdminUser,
              ActifUser: user.ActifUser,
              NomUser: user.NomUser,
              PrenomUser: user.PrenomUser
          },
          process.env.JWT_SECRET as string,
          { expiresIn: '1h' }
      );

      // Envoyer le token dans un cookie ou dans la réponse
      res.cookie('token', token, { httpOnly: false });
      res.status(200).json({
          message: 'Connexion réussie',
          token,
          IdUser: user.IdUser,
          AdminUser: user.AdminUser,
          ActifUser: user.ActifUser,
          NomUser: user.NomUser,
          PrenomUser: user.PrenomUser
      });

  } catch (error) {
      console.error("Erreur lors de l'authentification :", error);
      res.status(500).json({ error: "Erreur serveur" });
  }
});


LoginRouter.post('/update-password', async (req, res) => {
  const { AdresseMailUser, newPassword } = req.body;

  if (!AdresseMailUser || !newPassword) {
    return res.status(400).json({ message: 'Données manquantes.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await query(
      'UPDATE users SET MdpUser = ?  WHERE AdresseMailUser = ?',
      [hashedPassword, AdresseMailUser]
    );
    
    res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe." });
  }
});


  export default LoginRouter;