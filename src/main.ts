import express, { Request, Response } from "express";
import usersRouter from "./routes/usersRoute"
import tachesRouter from "./routes/tachesRoute";

const server = express();
server.use(express.json());
server.use("/admin", usersRouter)
server.use("/admin", tachesRouter)

server.listen(3000, () => console.log("Serveur prêt à démarrer"));
