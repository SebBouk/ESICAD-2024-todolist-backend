import express, { Request, Response } from "express";
import usersRouter from "./routes/usersRoute"
import tachesRouter from "./routes/tachesRoute";
import listeRouter from "./routes/listesRoutes";
import categoriesRouter from "./routes/CategoriesRoutes";
import authMiddleware from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";
import { actifMiddleware } from "../middlewares/actifMiddleware copy";
import LoginRouter from "./routes/loginRoute";
import cookieParser from "cookie-parser";

const server = express();
server.use(express.json());
server.use(cookieParser());
server.use("/", LoginRouter);
server.use("/admin", authMiddleware, roleMiddleware(1), actifMiddleware(1), usersRouter)
server.use("/admin", authMiddleware, roleMiddleware(1), actifMiddleware(1), tachesRouter)
server.use("/admin", authMiddleware, roleMiddleware(1), actifMiddleware(1), listeRouter)
server.use("/admin", authMiddleware, roleMiddleware(1), actifMiddleware(1), categoriesRouter)

server.listen(3000, () => console.log("Serveur prêt à démarrer"));
