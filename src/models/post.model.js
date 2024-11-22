const mongoose = require("mongoose");
const Comment = require("./comment.model");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  textContent: {
    type: String,
    required: [true, "Text content is required"],
  },
  postedOn: {
    type: String,
    enum: ["Global", "Campus"],
    required: [
      true,
      "Please specify where this post is published: Global or Campus.",
    ],
  },
  campusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School", // Referência à instituição associada
    required: function () {
      return this.postedOn === "Campus";
    },
  },
  image: {
    type: String,
  },
  video: {
    type: String,
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
      type: String,  // Alterado para armazenar o nome da escola como string
    },
  },
  postedByModel: {
    type: String,
    required: true,
    enum: ["School", "Student"],
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
  commentsEnabled: {
    type: Boolean,
    default: true,
  },
  comments: {
    type: [Comment.schema],
    default: [],
  },
  sharedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Supondo que você tenha um modelo User
    },
  ],
});

// Virtuals
postSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});
postSchema.virtual("dislikesCount").get(function () {
  return this.dislikes.length;
});

// Apliquei o populate manual para os posts com base em seu tipo
postSchema.methods.populatePostedBy = async function () {
  const model = this.postedByModel === "School" ? School : Student;
  const user = await model.findById(this.postedBy.id);
  this.postedBy.name = user.name;
  this.postedBy.photo = user.profileImage;
  if (this.postedByModel === "Student") {
    const school = await School.findById(user.school);
    this.postedBy.school = school ? school.name : ""; // Agora retorna o nome da escola
  } else if (this.postedByModel === "School") {
    this.postedBy.school = user.name; // No caso da escola, atribui o nome diretamente
  }
};

module.exports = mongoose.model("Post", postSchema);
