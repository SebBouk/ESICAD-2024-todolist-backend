import express, { Express, Request, Response } from "express";
import cors from "cors";

const server = express();
server.use(cors());
const monTableau = [
  { todo: "apprendre Vue Js", done: false },
  { todo: "apprendre à faire des boucles", done: false },
  { todo: "apprendre à griller des saucisses", done: true },
];

server.get("/todos", (req: Request, res: Response) => res.send(monTableau));

server.get("/toto", (req, res) => res.send("tototottoo"));

server.listen(3000, () => console.log("Serveur prêt à démarrer"));
