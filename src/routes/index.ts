import { Express } from "express";
import {
  shortenHandler,
  statsHandler,
  redirectHandler,
  topUrlsHandler,
} from "../handlers/urlHandlers";
import { rateLimitMiddleware } from "../middleware/rateLimiter";

// Bug 8 fix: wired up rateLimitMiddleware to POST /shorten
export function registerRoutes(app: Express): void {
  app.post("/shorten", rateLimitMiddleware, shortenHandler);
  app.get("/stats/:code", statsHandler);
  app.get("/admin/top", topUrlsHandler);
  app.get("/:code", redirectHandler);
}
