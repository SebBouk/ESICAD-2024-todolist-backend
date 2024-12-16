import express, { Request, Response } from "express";
import usersRouter from "./routes/usersRoute"
import tachesRouter from "./routes/tachesRoute";
import listeRouter from "./routes/listesRoutes";
import categoriesRouter from "./routes/CategoriesRoutes";

const server = express();
server.use(express.json());
server.use("/admin", usersRouter)
server.use("/admin", tachesRouter)
server.use("/admin", listeRouter)
server.use("/admin",categoriesRouter)

server.listen(3000, () => console.log("Serveur prêt à démarrer"));
