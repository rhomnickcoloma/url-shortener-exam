import { Request, Response, NextFunction } from "express";

const rateLimits: Record<string, number[]> = {};

export function resetRateLimits(): void {
  for (const key of Object.keys(rateLimits)) {
    delete rateLimits[key];
  }
}

// Bug 9 fix: added retry_after_seconds and corrected error message
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
    const oldestRequest = rateLimits[ip][0];
    const retryAfter = Math.ceil((60000 - (now - oldestRequest)) / 1000);

    res.status(429).json({
      error: "Rate limit exceeded. Try again later.",
      retry_after_seconds: retryAfter,
    });
    return;
  }

  rateLimits[ip].push(now);
  next();
}
