const express = require("express");
const dotenv = require("dotenv");
const server = express();
const mongoose = require("mongoose");
const path = require("path");
const Chat = require("./models/chat.js");
const feedbacks = require("./models/feedback.js");

dotenv.config();
const methodOverride = require("method-override");

server.set("views", path.join(__dirname,"views"));
server.set("view engine","ejs");

server.use(express.static(path.join(__dirname,"public")));
server.use(express.urlencoded({extended : true}));
server.use(methodOverride("_method"));

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/chatsAppDocker";

async function connectDatabase(){
    await mongoose.connect(mongoUrl);
}

connectDatabase()
    .then((res) => {
        console.log("Connection Success ");
    })
    .catch((err) => {
        console.log(err);
    });

server.get("/chats" ,async (req,res) =>{
    let chats = await Chat.find();
    res.render("index.ejs", { chats } );
});

server.get("/chats/new", (req,res) => {
    res.render("new.ejs");
});

server.post("/chats",(req,res) => {
    let { from ,message,to } = req.body;
    let newChat = new Chat({
        from : from,
        to:to,
        message:message,
        created_at : new Date()
    });

    newChat
    .save()
    .then((res) => {
        console.log("Created succesful");
    })
    .catch((err) => {
        console.log(err);
    });
    res.redirect("/chats");
});

server.get("/chats/:id/edit", async (req,res) => {
    let { id } = req.params;
    let chat =  await Chat.findById(id);
    res.render("edit.ejs" , { chat } );
});

server.get("/", (req,res) => {
    res.send("working");
});

server.put("/chats/:id",async (req,res) => {
    let {id}= req.params;
    let {newMessage}= req.body;
    await Chat.findByIdAndUpdate(id,{message : newMessage},{runValidators:true});
    res.redirect("/chats");
});

server.delete("/chats/:id", async (req,res) => {
    let {id}= req.params;
    await Chat.findByIdAndDelete(id);
    res.redirect("/chats");
});

server.get("/chats/feedback", (req,res) => {
    res.render("feedback.ejs");
});

server.post("/chats/feedback",(req,res) => {
    let { Feedback } = req.body;
    let userFeedback = new feedbacks({
        feedback:Feedback
    });

    userFeedback
    .save()
    .then((res) => {
        res.render("thanks.ejs");
    })
    .catch((err) => {
        console.log(err);
    });
    
});


server.get("/admin",(req,res) => {
    res.render("admin.ejs");
})

server.post("/admin", async (req,res) =>{
    let isAdmin = false;
   let {username, password } = req.body;
   let Feedbacks = await feedbacks.find();
   if(username === "yashgautam9953" && password === "987654") {
        isAdmin = true;
   }
   res.render("adminportal.ejs", {Feedbacks,isAdmin});
});

server.listen(8080 , () => {
    console.log("Server is Running success ....");
});