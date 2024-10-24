const express = require("express");
const router = express.Router();
const {
  createChallenge,
  challengesByCourse,
  getChallengeFile,
  challengeById,
  getAllChallenges,
  countChallenges,
  challengesByUser,
  updateChallenge,
  deleteChallenge,
  getChallengesByDifficulty,
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

module.exports = router;
