const express = require("express");
const authRouter = require("./auth.route");
const userRouter = require("./user.route");
const challengeRouter = require("./challenge.route");
const jobsRouter = require("./jobs.route");
const connectionsRouter = require("./connections.route");
const followRouter = require("./follow.route");
const saveRouter = require("./save.route");
const chatRouter = require("./chat.route");
const alertRouter = require("./alert.route");
const messageRoutes = require("./message.route");
const validateToken = require("./validate.token.route");
const postRouter = require("./post.route");

const app = express();

app.use("/auth/", authRouter);
app.use("", userRouter);
app.use("", challengeRouter);
app.use("", jobsRouter);
app.use("", connectionsRouter);
app.use("", followRouter);
app.use("", alertRouter);
app.use("", validateToken);
app.use("", postRouter);

// app.use("", saveRouter);
app.use("/chat/", chatRouter);
app.use("/messages", messageRoutes);

module.exports = app;
