const mongoose = require("mongoose");

function connect(callback) {
  let connectionString = `mongodb+srv://todo_2021:mycoolpassword@cluster0.jdtxt.mongodb.net/forum_2021?retryWrites=true&w=majority`;

  console.log("connect to db...");

  mongoose
    .connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .catch((err) => {
      console.log("There was an error connecting to the db", err);
    });

  mongoose.connection.once("open", callback);
}

module.exports = connect;
