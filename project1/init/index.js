const mongoose = require("mongoose");
const Data = require("./data.js");
const Listing = require("../models/listing.js");


const mongo_path = "mongodb://127.0.0.1:27017/guideme";

database().then(() =>{
    console.log("Connected to database ");
    })
    .catch((err) => {
        console.log(err);
    });

async function database(){
    await mongoose.connect(mongo_path);
}


const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(Data.data);
    console.log("Data Inserted Totally Success .");
};

initDB();