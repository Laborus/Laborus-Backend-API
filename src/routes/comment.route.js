const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");
const authenticateJWT = require("../middlewares/JWT.middleware");

// Rota para criar um novo comentário em um post
router.post("/:postId", authenticateJWT, commentController.createComment); // Criar comentário para um post

// Rota para editar um comentário pelo ID
router.put("/:commentId", authenticateJWT, commentController.editComment); // Editar comentário

// Rota para deletar um comentário pelo ID
router.delete("/:commentId", authenticateJWT, commentController.deleteComment); // Deletar comentário

// Rota para curtir um comentário (apenas 1 like por usuário)
router.post("/:commentId/like", authenticateJWT, commentController.likeComment); // Curtir comentário

module.exports = router;
