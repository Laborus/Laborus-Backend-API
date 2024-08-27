const express = require("express");
const authRouter = require("./auth.route");
const userRouter = require("./user.route");

const app = express();

app.use("/auth/", authRouter);
app.use("", userRouter);

module.exports = app;
