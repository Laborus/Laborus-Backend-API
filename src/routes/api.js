const express = require("express");
const authRouter = require("./auth.route");
const userRouter = require("./user.route");
const challengeRouter = require("./challenge.route");

const app = express();

app.use("/auth/", authRouter);
app.use("", userRouter);
app.use("", challengeRouter);

module.exports = app;
