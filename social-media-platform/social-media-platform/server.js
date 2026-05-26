const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/socialapp");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "secretkey",
  resave: false,
  saveUninitialized: true
}));

const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");

app.get("/", async (req, res) => {
  const posts = await Post.find();
  res.render("index", { posts, user: req.session.user });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password
  });

  if (user) {
    req.session.user = user;
    res.redirect("/");
  } else {
    res.send("Invalid Login");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/profile", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const posts = await Post.find({ user: req.session.user.name });
  res.render("profile", {
    user: req.session.user,
    posts
  });
});

app.post("/create-post", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const post = new Post({
    user: req.session.user.name,
    content: req.body.content,
    likes: 0
  });

  await post.save();
  res.redirect("/");
});

app.get("/post/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  const comments = await Comment.find({ postId: req.params.id });

  res.render("post", { post, comments });
});

app.post("/comment/:id", async (req, res) => {
  const comment = new Comment({
    postId: req.params.id,
    user: req.session.user.name,
    text: req.body.text
  });

  await comment.save();
  res.redirect("/post/" + req.params.id);
});

app.get("/like/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  post.likes += 1;
  await post.save();

  res.redirect("/");
});

app.get("/follow/:id", async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user.followers) {
    user.followers = 0;
  }

  user.followers += 1;
  await user.save();

  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});