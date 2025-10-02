const express = require("express");
const server = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync.js");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const route = require("./routes/listing.js");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/User.js");

server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(methodOverride("_method"));
server.use(express.static(path.join(__dirname, "public")));
server.engine("ejs", ejsMate);

const mongo_path = "#";

database()
  .then(() => {
    console.log("Connected to database ");
  })
  .catch((err) => {
    console.log(err);
  });

async function database() {
  await mongoose.connect(mongo_path);
}

server.set("view engine", "ejs");
server.set("views", path.join(__dirname, "views"));

server.get("/", (req, res) => {
  res.send("get req success");
});

server.use("/listings", route);

server.use(
  session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: true,
  })
);

server.use(passport.initialize());
server.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

server.get("/signup", async (req, res) => {
  res.render("userAuth/signup.ejs");
});

server.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = new User({ username, email });
    let registeredUser = await User.register(user, password);
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
});

server.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.render("listings/error.ejs", { message });
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
