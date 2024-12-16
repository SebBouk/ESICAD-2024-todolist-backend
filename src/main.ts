import express, { Request, Response } from "express";
import usersRouter from "./routes/usersRoute"
import tachesRouter from "./routes/tachesRoute";
import listeRouter from "./routes/listesRoutes";

const server = express();
server.use(express.json());
server.use("/admin", usersRouter)
server.use("/admin", tachesRouter)
server.use("/admin", listeRouter)

server.listen(3000, () => console.log("Serveur prêt à démarrer"));
