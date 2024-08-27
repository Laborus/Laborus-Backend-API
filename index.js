const express = require("express");
const dotenv = require("dotenv");
const DatabaseConnection = require("./src/database/db.connection");
const appRouter = require("./src/routes/app");
const apiRouter = require("./src/routes/api");

const app = express();
const PORT = process.env.SERVER_PORT || 3333;

dotenv.config();

// Route prefixes

app.use(express.json());
app.use("/", appRouter);
app.use("/api/", apiRouter);

// Database connection

DatabaseConnection();

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
