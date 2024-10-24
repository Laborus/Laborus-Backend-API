const express = require("express");
const router = express.Router();
const submittUpload = require("../utils/upload");
const {
  createChallenge,
  getChallengeFile,
  challengeById,
  getAllChallenges,
  challengesByUser,
  updateChallenge,
  deleteChallenge,
  getChallengesByDifficulty,
  submitChallenge,
  cancelSubmission,
  updateSubmissionStatus,
  getAllSubmissions,
  getSubmissionsForChallenge,
} = require("../controllers/challenge.controller");
const authenticateJWT = require("../middlewares/JWT.middleware"); // Ajuste o caminho conforme necessário

// Definição das rotas com autenticação JWT
router.post("/challenge", authenticateJWT, createChallenge);
// router.get("/challenges/course/:courseId", authenticateJWT, challengesByCourse);
router.get("/challenges/difficulty", getChallengesByDifficulty);

router.get("/challenges/:id/file", authenticateJWT, getChallengeFile);
router.get("/challenges/:id", authenticateJWT, challengeById);
router.get("/challenges", authenticateJWT, getAllChallenges);
// router.get("/challenges/count", authenticateJWT, countChallenges);
router.get("/challenges/user", authenticateJWT, challengesByUser);
router.put("/challenges/:id", authenticateJWT, updateChallenge);
router.delete("/challenges/:id", authenticateJWT, deleteChallenge);

// Submit a Challenge
router.post(
  "/submit-challenge",
  authenticateJWT,
  submittUpload,
  submitChallenge
);

// Route to get all submissions
// router.get("/submissions", getAllSubmissions);

// Cancel Submission
router.post("/cancel-submission", authenticateJWT, cancelSubmission);

// Get Submissions for a Challenge
// router.get(
//   "/submissions/:challengeId",
//   authenticateJWT,
//   getSubmissionsForChallenge
// );

// Approved Or Reject Submission

// Route for updating the status of a submission
router.put(
  "/submissions/:submissionId/status", // Route to update submission status
  authenticateJWT, // Ensure the user is authenticated
  updateSubmissionStatus // Controller function to handle the request
);

module.exports = router;
