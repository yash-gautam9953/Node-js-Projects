const mongoose = require("mongoose");
const Chat = require("./models/chat.js");

async function connectDatabase(){
    await mongoose.connect("mongodb://127.0.0.1:27017/chatsApp");
}

connectDatabase()
    .then((res) => {
        console.log("Connection Success ");
    })
    .catch((err) => {
        console.log(err);
    });


let allChats = [
    {
        from : "neha", 
        to : "harsh", 
        message : "hii",
        created_at : new Date(),
    },
    {
        from : "yash", 
        to : "harsh", 
        message : "hello",
        created_at : new Date(),
    },
    {
        from : "kalash", 
        to : "parash", 
        message : "hit me ",
        created_at : new Date(),
    },
    {
        from : "kalash", 
        to : "deepanshu", 
        message : "hii what are you doing",
        created_at : new Date(),
    },
    {
        from : "neha", 
        to : "deepali", 
        message : "send me notes",
        created_at : new Date(),
    },
];

Chat.insertMany(allChats);