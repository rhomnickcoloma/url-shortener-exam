import { Request, Response } from "express";
import {
  createShortUrl,
  getUrlStats,
  getUrlByCode,
  recordVisit,
  getTopUrls,
} from "../services/urlService";

// Bug 1 fix: catch validation errors and return 400
export function shortenHandler(req: Request, res: Response): void {
  const url = req.body.url;

  try {
    const result = createShortUrl(url);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Bug 2 fix: handle null return from getUrlStats
export function statsHandler(req: Request, res: Response): void {
  const code = req.params.code;
  const stats = getUrlStats(code);

  if (!stats) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(stats);
}

export function redirectHandler(req: Request, res: Response): void {
  const code = req.params.code;
  const row = getUrlByCode(code);

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  recordVisit(code);
  res.redirect(row.original_url);
}

export function topUrlsHandler(_req: Request, res: Response): void {
  const top = getTopUrls();
  res.json({ top_urls: top });
}
