import { Express } from "express";
import {
  shortenHandler,
  statsHandler,
  redirectHandler,
  topUrlsHandler,
} from "../handlers/urlHandlers";

export function registerRoutes(app: Express): void {
  app.post("/shorten", shortenHandler);
  app.get("/stats/:code", statsHandler);
  app.get("/admin/top", topUrlsHandler);
  app.get("/:code", redirectHandler);
}
