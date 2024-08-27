const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  cpf: {
    type: String,
    required: [true, "Please! CPF is required."],
    unique: [true, "CPF is already in use."],
    trim: true,
  },
  school: {
    type: String,
    required: [true, "Please! School is required."],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Please! Course is required."],
  },
  connections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: function (connections) {
          return !connections.includes(this.user);
        },
        message: "A user cannot connect to themselves.",
      },
    },
  ],
});

module.exports = mongoose.model("Student", studentSchema);
