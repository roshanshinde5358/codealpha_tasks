const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/ecommerce");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "secretkey",
  resave: false,
  saveUninitialized: true
}));

const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");

app.get("/", async (req, res) => {
  const products = await Product.find();
  res.render("index", { products, user: req.session.user });
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
    req.session.cart = [];
    res.redirect("/");
  } else {
    res.send("Invalid Login");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/product/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render("product", { product });
});

app.get("/add-to-cart/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!req.session.cart) {
    req.session.cart = [];
  }

  req.session.cart.push(product);
  res.redirect("/cart");
});

app.get("/cart", (req, res) => {
  const cart = req.session.cart || [];
  res.render("cart", { cart });
});

app.post("/order", async (req, res) => {
  const order = new Order({
    user: req.session.user.email,
    products: req.session.cart
  });

  await order.save();
  req.session.cart = [];
  res.send("Order Placed Successfully");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});