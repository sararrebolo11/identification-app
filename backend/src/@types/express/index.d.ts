export {};

declare global {
  namespace Express {
    interface User {
      id: string;
      role: import("@prisma/client").Role;
    }

    interface Request {
      user?: User;
    }
  }
}