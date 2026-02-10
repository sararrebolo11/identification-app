import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes";
import personsRoutes from "./modules/persons/persons.routes";
import documentsRoutes from "./modules/documents/documents.routes";
import exportRoutes from "./modules/exports/exports.routes";
import ocrRoutes from "./modules/ocr/ocr.routes";
import usersRoutes from "./modules/user/users.routes";

const app = express();

/* =======================
   MIDDLEWARES BASE
   ======================= */
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

/* =======================
   BODY PARSERS (ANTES!)
   ======================= */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

/* =======================
   ROTAS
   ======================= */
app.use("/auth", authRoutes);
app.use("/persons", personsRoutes);
app.use("/documents", documentsRoutes);
app.use("/export", exportRoutes);
app.use("/ocr", ocrRoutes);
app.use("/users", usersRoutes);

/* =======================
   HEALTHCHECK
   ======================= */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
