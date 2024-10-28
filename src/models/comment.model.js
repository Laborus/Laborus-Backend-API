const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  textContent: {
    type: String,
    required: [true, "Conteúdo do comentário é obrigatório."],
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "postedByModel", // Referência ao modelo correto
    required: true,
  },
  postedByModel: {
    type: String,
    enum: ["School", "Student"], // Modelos permitidos
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post", // Referência ao modelo Post
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date, // Adiciona o campo updatedAt
    default: Date.now, // Definido para agora por padrão
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: "userModel",
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: "userModel",
  }],
  userModel: {
    type: String,
    enum: ["School", "Student"],
    default: "Student",
  },
});

// Middleware para atualizar updatedAt antes de salvar
commentSchema.pre("save", function (next) {
  this.updatedAt = Date.now(); // Atualiza updatedAt sempre que o documento for salvo
  next();
});

module.exports = mongoose.model("Comment", commentSchema);
