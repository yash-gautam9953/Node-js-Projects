const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const Path = require("path");
const methodOverride = require('method-override');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", Path.join(__dirname, "/views"));

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "987654",
  database: "nodeServer",
});

// let q = "INSERT INTO user(id,username,email,password) VALUES ?";

// let data = [];

// for (let i = 0; i < 10; i++) {
//   data.push(getRandomUser());
// }
// try {
//   connection.query(q, [data], (err, res) => {
//     if (err) throw err;
//     console.log(res);
//   });
// } catch (err) {
//   console.log(err);
// }
// connection.end();

app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      const userCount = result[0]["count(*)"];
      res.render("home.ejs", { userCount });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});

app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;
  try {
    connection.query(q, (err, data) => {
      if (err) throw err;
      res.render("showdata.ejs", { data });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});

app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = "SELECT * FROM user WHERE id = ?";
  try {
    connection.query(q, [id],(err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { newUsername , formPassword } = req.body;
  let q = "SELECT * FROM user WHERE id = ?";
  try {
    connection.query(q, [id],(err, result) => {
      if (err) throw err;
      let user = result[0];
      if(formPassword != user.password){
        res.send("Wrong Passsword");
      }else{
        let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
        connection.query(q2,(err,result) => {
          if (err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB");
  }
});

app.listen("8080", () => {
  console.log("Server is listening ...............");
});
