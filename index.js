import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { options } from "./options.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const uri = `mongodb+srv://${options.username}:${options.password}@projectcluster.gpsdpyf.mongodb.net/?retryWrites=true&w=majority`;

const connection = () => {
  try {
    mongoose.connect(uri, { useNewUrlParser: true });
    console.log("mongoose connected successfully");
  } catch (err) {
    console.log(err);
  }
};

const choresUserSchema = {
  name: String,
  email: String,
  password: String,
  chores: [String]
};

const choresUser = mongoose.model("choresuser", choresUserSchema);

const currentUser = new choresUser();
var queryEmail = "";
var userChores;

const newObject = async () => {
  try {
    const damilola = await new choresUser({
      name: "Damilola",
      email: "d@gmail.com",
      password: "qwerty2",
      chores: ["Clean the house", "Write a paper"]
    });
    await damilola.save();
    console.log("New document added");
  } catch (err) {
    console.log(err);
  }
}

app.get("/", (req, res) => {
  //newObject();
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  currentUser.email = req.body.email;
  currentUser.password = req.body.password;
  queryEmail = req.body.email;
  let found = async () => {
    let userExists = await choresUser.exists({ email: currentUser.email });
    if (userExists !== null) {
      console.log("document found");
      res.render("chores", { name: "", userChores: [] });
    } else {
      console.log("document not found");
      res.render("register");
    }
  };
  found();
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  try {
    currentUser.name = req.body.name;
    currentUser.email = req.body.email;
    currentUser.password = req.body.password;
    queryEmail = req.body.email;
    currentUser.save();
    console.log("New User added");
    console.log(currentUser.name, currentUser.email, currentUser.password);
    res.render("chores", { name: currentUser.name, userChores: currentUser.chores });
  } catch (err) {
    console.log(err);
  }
});

// Fetches All Entered Chores into the database.

app.get("/all-chores", (req, res) => {
  console.log(currentUser.email);
  const foundUser = async () => {
    const data = await choresUser.find({ email: currentUser.email });
    //const { chores } = data[1];
    //console.log(chores);
    //console.log(data.chores);
    console.log("all documents found");
    res.render("chores", { name: "", userChores: data || ["No chores yet"] });
  }
  foundUser();
});

// Adds a Chore into the database

app.get("/add-chores", (req, res) => {
  res.render("add-chores");
});

app.post("/add-chores", (req, res) => {
  /*
  const addChores = async () => {
    try {
      await choresUser.updateOne({ email: queryEmail }, { chores: req.body.chores });
      console.log("added one chore");
    } catch (err) {
      console.log(err);
    }
  }
  addChores();*/

  /*
  const addChores2 = async () => {
    const currentUser = await new choresUser();
    await currentUser.chores.push(req.body.chores);
    console.log("Chores have been added to the array");
  }*/

  //addChores2();
  const saveNewChores = async() => {
    if(queryEmail === currentUser.email){
    await currentUser.chores.push(req.body.chores);
    await currentUser.save();
    console.log("Chores has been added to array");
    res.render("chores", {userChores: [], name: ""});
    }
  }
  saveNewChores();
  //console.log(currentUser.chores, currentUser.name, currentUser.email, currentUser._id);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server ti wa online");
  connection();
});

// logout route
app.get("/logout", (req, res) => {
  currentUser.name = "";
  currentUser.email = "";
  currentUser.password = "";
  currentUser.chores = [];
  queryEmail = "";
  userChores = [];
  console.log("Logged Out");
  res.render("logout");
});

// Do a check to make sure the email is unique in the database.
// A few errors, I'd have to fine-tune the application but we are almost there like 60-65%
// A few notes
// 1. Meant to create different collections - one for users and the other for chores
// 2. Find a way to link together the two collections.
// The answer to the above is Sub-Documents.