// import packages
const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const {v4 :uuidv4 } = require("uuid");
const methodOverride = require("method-override");


// set Directory for express
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// use public

app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parses JSON data


// Send Request

let posts = [
  { id: uuidv4(), username: "yash gautam", content: "Hello coders" },
  { id: uuidv4(), username: "harsh gautam", content: "Hello bank manager" },
  { id: uuidv4(), username: "kalash gautam", content: "hello bro" },
];

app.get("/posts", (req, res) => {
  res.render("index.ejs", { posts });
});

app.get("/posts/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/posts", (req, res) => {
  let { username, content } = req.body;
  let id = uuidv4();
  posts.push({ id,username, content });
  res.redirect("/posts");
});

app.get("/posts/:id", (req, res) => {
  let { id } = req.params;
  let post = posts.find((p) => p.id === id);

  if (!post) {
    return res.status(404).send("Post not found");
  }

  res.render("show.ejs", { post });
});


app.patch("/posts/:id",(req , res) => {
  let { id } = req.params; 
  let newContent = req.body.content;
  console.log(newContent, id);
  let post = posts.find((p) => p.id === id);
  post.content=newContent;
  res.redirect("/posts");
});


app.get("/posts/:id/edit",(req,res) => {
  let { id } = req.params;
  let post = posts.find((p) => p.id === id);
  res.render("edit.ejs", { post });
});

app.delete("/posts/:id",(req,res) => {
  let{ id } = req.params;
  posts = posts.filter((p) => p.id !== id);
  res.redirect("/posts");
});
// Server is listening
app.listen(port, () => {
  console.log(`server is listening on port no. ${port}`);
});
