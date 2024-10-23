const express = require("express");
const router = express.Router();
const challengeController = require("../controllers/challenge.controller");
const { authenticateJWT } = require("../middlewares/JWT.middleware"); // Middleware de autenticação, se necessário

// Rota para criar um novo desafio
router.post("/challenge", challengeController.createChallenge);

router.get("/challenges", challengeController.getAllChallenges);

router.get("/count", authenticateJWT, challengeController.countChallenges);

router.get("/:id", authenticateJWT, challengeController.challengeById);

router.get("/user", authenticateJWT, challengeController.challengesByUser);

router.get(
  "/course/:courseId",
  authenticateJWT,
  challengeController.challengesByCourse
);

router.get("/file/:id", authenticateJWT, challengeController.getChallengeFile);

router.put("/:id", authenticateJWT, challengeController.updateChallenge);

router.delete("/:id", authenticateJWT, challengeController.deleteChallenge);

module.exports = router;
