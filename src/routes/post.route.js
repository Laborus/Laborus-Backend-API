const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const authenticateJWT = require("../middlewares/JWT.middleware");

// Rota para criar um novo post (global)
router.post("/post", authenticateJWT, postController.createPost); // Global

// Rota para criar um novo post para um campus específico
router.post(
  "/post/:campusId",
  authenticateJWT,
  postController.createPostForCampus
); // Campus

// Rota para buscar todos os posts globais
router.get("/posts/global", authenticateJWT, postController.getGlobalPosts);

// Rota para buscar todos os posts de um campus específico
router.get(
  "/posts/campus/:campusId",
  authenticateJWT,
  postController.getCampusPosts
);

router.get("/post/user/:userId", authenticateJWT, postController.postsByUserId);

// Rota para buscar um post específico pelo ID
router.get("/post/:id", authenticateJWT, postController.postById);

// Rota para atualizar um post pelo ID
router.put("/post/:id", authenticateJWT, postController.updatePost);

// Rota para deletar um post pelo ID
router.delete("/post/:id", authenticateJWT, postController.deletePost);

// Rota para curtir um post (apenas 1 like por usuário)
router.post("/post/:id/like", authenticateJWT, postController.like);

// Rota para descurtir um post (apenas 1 dislike por usuário)
router.post("/post/:id/dislike", authenticateJWT, postController.dislike);

// Rota para compartilhar um post
router.post("/post/:id/share", authenticateJWT, postController.sharePost);

// Rota para reportar um post (apenas 1 report por usuário)
router.post("/post/:id/report", authenticateJWT, postController.reportPost);

module.exports = router;
