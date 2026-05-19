import express from "express";
import { registerRoutes } from "./routes";
import { initDatabase } from "./database/db";

const app = express();

app.use(express.json());

initDatabase();
registerRoutes(app);

export { app };
