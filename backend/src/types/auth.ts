import { Request } from "express";

export interface AuthUser {
  userId: string;
  role: string;
}