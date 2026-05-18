import { Request, Response, NextFunction } from "express";

const rateLimits: Record<string, number[]> = {};

export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const ip = req.ip || "unknown";
  const now = Date.now();

  if (!rateLimits[ip]) {
    rateLimits[ip] = [];
  }

  rateLimits[ip] = rateLimits[ip].filter((t) => now - t < 60000);

  if (rateLimits[ip].length >= 10) {
    res.status(429).json({ error: "Rate limit exceeded" });
    return;
  }

  rateLimits[ip].push(now);
  next();
}
