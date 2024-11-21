const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  textContent: {
    type: String,
    required: [true, "Conteúdo do comentário é obrigatório."],
  },
  postedBy: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "postedByModel",
    },
    name: {
      type: String,
      required: [true, "O nome do autor é obrigatório."],
    },
    photo: {
      type: String,
      default: "../public/images/bannerImage_default.png",
    },
    school: {
      type: String,
      required: [true, "O nome da escola é obrigatório."],
    },
  },
  postedByModel: {
    type: String,
    enum: ["School", "Student"],
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userModel",
    },
  ],
  dislikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userModel",
    },
  ],
  userModel: {
    type: String,
    enum: ["School", "Student"],
    default: "Student",
  },
});

// Middleware para atualizar `updatedAt` antes de salvar
commentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Comment", commentSchema);
