import { timingSafeEqual } from "node:crypto";
import type { Request, RequestHandler, Response } from "express";

/** Constant-time string comparison that does not short-circuit on the first byte. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function extractBearerToken(header: string | undefined): string | undefined {
  if (!header) {
    return undefined;
  }

  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return undefined;
  }

  return token;
}

export function isAuthorized(header: string | undefined, expectedToken: string): boolean {
  const token = extractBearerToken(header);
  if (token === undefined) {
    return false;
  }
  return safeEqual(token, expectedToken);
}

export function createBearerAuthMiddleware(expectedToken: string): RequestHandler {
  return (req: Request, res: Response, next) => {
    if (!isAuthorized(req.header("authorization"), expectedToken)) {
      res.status(401).json({
        jsonrpc: "2.0",
        error: {
          code: -32001,
          message: "Missing or invalid bearer token"
        },
        id: null
      });
      return;
    }

    next();
  };
}

export function createOriginGuard(allowedOrigins: string[]): RequestHandler {
  return (req: Request, res: Response, next) => {
    const origin = req.header("origin");
    if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
      res.status(403).json({
        jsonrpc: "2.0",
        error: {
          code: -32002,
          message: "Origin is not allowed"
        },
        id: null
      });
      return;
    }

    next();
  };
}
