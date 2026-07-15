const mongoose = require('mongoose');

const uri = "mongodb://MovieAdmin:Vishu1590@ac-ohfdqkv-shard-00-00.h8nc1yq.mongodb.net:27017,ac-ohfdqkv-shard-00-01.h8nc1yq.mongodb.net:27017,ac-ohfdqkv-shard-00-02.h8nc1yq.mongodb.net:27017/printflow?ssl=true&replicaSet=atlas-7pow09-shard-0&authSource=admin&appName=Cluster0";

console.log("Connecting to MongoDB Atlas standard link...");
mongoose.connect(uri)
  .then(() => {
    console.log("SUCCESS! Connected successfully.");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAILURE! Connection error:", err);
    process.exit(1);
  });
