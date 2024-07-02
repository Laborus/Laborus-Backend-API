const mongoose = require("mongoose");

const DatabaseConnection = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.asbteqh.mongodb.net/laborusDB?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Connection to database successful!");
  } catch (error) {
    console.error("Failed to connect to database: ", error);
    process.exit(1);
  }
};

module.exports = DatabaseConnection;
