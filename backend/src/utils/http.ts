import { Response } from "express";

export function badRequest(
  res: Response,
  message: string,
  issues?: unknown
) {
  return res.status(400).json({
    message,
    ...(issues ? { issues } : {}),
  });
}
