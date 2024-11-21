const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");
const authenticateJWT = require("../middlewares/JWT.middleware");

// Rota para criar um novo comentário em um post
router.post("/comment/:postId", authenticateJWT, commentController.createComment); // Criar comentário para um post

// Rota para editar um comentário pelo ID
router.put("/comment/:commentId", authenticateJWT, commentController.editComment); // Editar comentário

// Rota para deletar um comentário pelo ID
router.delete("/comment/:commentId", authenticateJWT, commentController.deleteComment); // Deletar comentário

// Rota para curtir um comentário (apenas 1 like por usuário)
router.post("/comment/:commentId/like", authenticateJWT, commentController.likeComment); // Curtir comentário

module.exports = router;
