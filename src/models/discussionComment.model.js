const mongoose = require("mongoose");

const discussionCommentSchema = new mongoose.Schema({
  textContent: { type: String, required: true },
  postedBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    name: { type: String, required: true },
    photo: { type: String }, // Campo opcional
    school: { type: String, required: true }, // Nome da escola (String)
  },
  postedByModel: { type: String, required: true }, // Exemplo: "Student"
  discussionId: { type: mongoose.Schema.Types.ObjectId, ref: "Discussion", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
});

module.exports = mongoose.model("DiscussionComment", discussionCommentSchema);
