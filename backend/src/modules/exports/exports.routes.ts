import { Router } from "express";
import { auth } from "../../middleware/auth";
import { requireRole } from "../../middleware/role";
import { exportPersonsToExcel } from "./exports.service";
import { Role } from "@prisma/client";

const router = Router();

/**
 * GET /export/persons/excel
 * Exporta todas as pessoas e documentos para Excel
 */
router.get(
  "/persons/excel",
  auth,
  requireRole(Role.ADMIN, Role.USER),
  async (req, res) => {
    try {
      const workbook = await exportPersonsToExcel(req.user!.id);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="pessoas.xlsx"'
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
      res.status(500).json({ message: "Erro ao exportar Excel" });
    }
  }
);

export default router;
