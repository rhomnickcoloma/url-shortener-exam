import express from "express";
import { registerRoutes } from "./routes";
import { initDatabase } from "./database/db";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

initDatabase();
registerRoutes(app);

export { app };
