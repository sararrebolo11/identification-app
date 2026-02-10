import bcrypt from "bcrypt";
import { prisma } from "../prisma";

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const user = await prisma.user.create({
    data: {
      email: "admin@policia.local",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin criado:", user.email);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
