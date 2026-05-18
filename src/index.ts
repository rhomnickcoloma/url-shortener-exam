import express from "express";
import { registerRoutes } from "./routes";
import { initDatabase } from "./database/db";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

initDatabase();
registerRoutes(app);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
