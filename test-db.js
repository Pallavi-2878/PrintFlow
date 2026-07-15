const mongoose = require('mongoose');

const uri = "mongodb+srv://MovieAdmin:Vishu1590@cluster0.h8nc1yq.mongodb.net/printflow?retryWrites=true&w=majority";

console.log("Connecting to MongoDB Atlas...");
mongoose.connect(uri)
  .then(() => {
    console.log("SUCCESS! Connected successfully.");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAILURE! Connection error:", err);
    process.exit(1);
  });
