const mongoose = require("mongoose");
const DiscussionComment = require("./discussionComment.model"); // Modelo correto para comentários
const School = require("./school.model");
const Student = require("./student.model");

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  postedBy: {
    id: { 
      type: mongoose.Schema.Types.ObjectId, 
      refPath: "postedByModel", 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    photo: { 
      type: String 
    },
    school: { 
      type: String, // Nome da escola
    },
  },
  postedByModel: {
    type: String,
    required: true,
    enum: ["School", "Student"],
  },
  campusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School", // Referência ao campus
    required: true,
  },
  commentsEnabled: {
    type: Boolean,
    default: true,
  },
  comments: {
    type: [DiscussionComment.schema], // Usando o schema do DiscussionComment
    default: [],
  },
  selectedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DiscussionComment", // Referência para um comentário específico
  },
  isClosed: {
    type: Boolean,
    default: false,
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
  reports: [
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
  sharedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Supondo que você tenha um modelo User
    },
  ],
});

// Método para retornar `postedBy` com detalhes completos
discussionSchema.methods.populatePostedByDetails = async function () {
  const model = this.postedByModel === "School" ? School : Student;
  const user = await model.findById(this.postedBy.id);
  this.postedBy.name = user.name;
  this.postedBy.photo = user.profileImage;
  if (this.postedByModel === "Student") {
    const school = await School.findById(user.school);
    this.postedBy.school = school ? school.name : ""; // Retorna o nome da escola
  } else if (this.postedByModel === "School") {
    this.postedBy.school = user.name; // Atribui o nome diretamente para escola
  }
};

// Virtuals
discussionSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});
discussionSchema.virtual("dislikesCount").get(function () {
  return this.dislikes.length;
});

module.exports = mongoose.model("Discussion", discussionSchema);
