const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobs.controller");
const authenticate = require("../middlewares/JWT.middleware");
const submittUpload = require("../utils/upload");

router.get("/jobs", jobController.getAllJobs);
router.get("/jobs/:jobId", jobController.getJobById);
router.post("/job", authenticate, jobController.createJob);
// Rota para editar uma vaga de emprego
router.put("/jobs/:jobId", authenticate, jobController.updateJob);
router.delete("/jobs/:jobId", jobController.deleteJob);
router.delete("/delete-jobs", jobController.deleteAllJobs);

router.post(
  "/jobs/submit",
  authenticate,
  submittUpload,
  jobController.submitJob
);

// Rota para cancelar uma submissão de trabalho
router.delete(
  "/jobs/cancel/:submissionId",
  authenticate,
  jobController.cancelJobSubmission
);

// Rota para listar vagas de emprego do tipo ESTAGIO ou APRENDIZ
router.get("/jobs/by-type", jobController.getJobsByType);

module.exports = router;
