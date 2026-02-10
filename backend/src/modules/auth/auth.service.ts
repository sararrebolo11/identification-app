import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Credenciais inválidas");
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);

  if (!passwordValid) {
    throw new Error("Credenciais inválidas");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}