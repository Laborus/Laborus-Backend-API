const express = require("express");
const dotenv = require("dotenv");
const DatabaseConnection = require("./src/database/db.connection");
const appRouter = require("./src/routes/app");
const apiRouter = require("./src/routes/api");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const socketController = require("./src/controllers/socket.controller");

const app = express();
const PORT = process.env.SERVER_PORT || 3333;

dotenv.config();

// Route prefixes
app.use(cors());
app.use(express.json());
app.use("/", appRouter);
app.use("/api/", apiRouter);

// Database connection

DatabaseConnection();

// Configuração do servidor e do Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Permitir acesso de qualquer origem
    methods: ["GET", "POST"],
  },
});

// Importar o controller do Socket.IO
socketController(io);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
