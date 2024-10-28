const express = require("express");
const authRouter = require("./auth.route");
const userRouter = require("./user.route");
const challengeRouter = require("./challenge.route");
const postRouter = require("./post.route"); // Importando as rotas de post
const commentRouter = require("./comment.route"); // Importando as rotas de comentário

const app = express();

// Middleware para interpretar JSON
app.use(express.json());

// Definindo os caminhos base para as rotas
app.use("/posts", postRouter); // Rotas para posts
app.use("/comments", commentRouter); // Rotas para comentários
app.use("/auth", authRouter); // Ajuste conforme necessário
app.use("/users", userRouter); // Ajuste conforme necessário
app.use("/challenges", challengeRouter); // Ajuste conforme necessário

module.exports = app;
