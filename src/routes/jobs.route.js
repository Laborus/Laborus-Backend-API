const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobs.controller");
const authMiddleware = require("../middlewares/JWT.middleware");

// Criar uma nova vaga de emprego
router.post("/jobs", authMiddleware.verifyCompany, jobController.createJob);

// Atualizar uma vaga de emprego
router.put(
  "/jobs/:jobId",
  authMiddleware.verifyCompany,
  jobController.updateJob
);

// Deletar uma vaga de emprego
router.delete(
  "/jobs/:jobId",
  authMiddleware.verifyCompany,
  jobController.deleteJob
);

// Enviar aplicação para uma vaga de emprego
router.post(
  "/jobs/apply",
  authMiddleware.verifyStudent,
  jobController.submitJob
);

// Listar estudantes que aplicaram para a vaga
router.get(
  "/jobs/:jobId/applications",
  authMiddleware.verifyCompany,
  jobController.submittedStudents
);

// Reportar uma vaga de emprego
router.post(
  "/jobs/:jobId/report",
  authMiddleware.verifyStudent,
  jobController.reportJob
);

module.exports = router;
