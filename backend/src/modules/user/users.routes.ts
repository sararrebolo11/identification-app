import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma";
import { auth } from "../../middleware/auth";
import { Role } from "@prisma/client";
import { badRequest } from "../../utils/http";

const router = Router();

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.put("/me/password", auth, async (req, res) => {
  const parsed = passwordChangeSchema.safeParse(req.body);
  if (!parsed.success) {
    return badRequest(res, "Dados inválidos", parsed.error.flatten());
  }

  const { currentPassword, newPassword } = parsed.data;

  if (!req.user) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user) {
    return res.status(404).json({ message: "Utilizador não encontrado" });
  }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Password atual incorreta" });
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  res.json({ message: "Password alterada com sucesso" });
});

router.get("/profile", auth, async (req, res) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "Utilizador não encontrado" });
  }

  res.json(user);
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return badRequest(res, "Dados inválidos", parsed.error.flatten());
  }

  const { email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({ message: "Email já registado" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: Role.USER,
    },
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  res.status(201).json({
  token,
  user: {
    id: user.id,
    email: user.email,
    role: user.role,
  },
});
});

export default router;
