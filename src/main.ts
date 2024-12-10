import express, { Request, Response } from "express";
import usersRouter from "./routes/usersRoute"

const server = express();
server.use(express.json());
server.use("/admin", usersRouter)

server.listen(3000, () => console.log("Serveur prêt à démarrer"));
