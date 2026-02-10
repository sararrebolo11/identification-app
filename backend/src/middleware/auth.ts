import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function auth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token em falta" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role: string;
    };

    req.user = {
      id: payload.userId,
      role: payload.role as any,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}