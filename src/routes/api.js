const express = require("express");
const authRouter = require("./auth.route");
const userRouter = require("./user.route");
const challengeRouter = require("./challenge.route");
const postRouter = require("./post.route"); // Importando as rotas de post

const app = express();

// Middleware para interpretar JSON
app.use(express.json());

app.use("/posts", postRouter); // Definindo o caminho base para posts
app.use("/auth", authRouter); // Ajuste conforme necessário
app.use("/users", userRouter); // Ajuste conforme necessário
app.use("/challenges", challengeRouter); // Ajuste conforme necessário

module.exports = app;
