const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const MONGO_URL =  "mongodb://127.0.0.1:27017/wanderlust";

 main()
   .then(() => {
    console.log("Connected to DB");
  }).catch((err) => {
    console.log(err);
  });

async function main() {
    await mongoose.connect(MONGO_URL);
}
const initDB = async () => {
    await Listing.deleteMany({}); // delete all the data in the collection
    initData.data.map((obj) => (
    {...obj, owner: "64f0c8b2d1e4f3a1b8c9e7a1" // add author field to each object
    }));
    await Listing.insertMany(initData.data);
    console.log("Data was initialised");
};
initDB();

