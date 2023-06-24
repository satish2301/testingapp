const express = require("express");
const hbs = require("hbs");
const path = require("path");
const app = express();
const PORT = 4000;
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./views"));
hbs.registerPartials(path.join(__dirname, "./views/partials"));
app.use(express.static(path.join(__dirname, "./public")));

app.get("/", (req, res) => {
  try {
    res.render("index");
  } catch (error) {
    console.log("internal error", error);
  }
});
app.post("/dashboard", (req, res) => {
  try {
    const username = req.body.username;
    res.render("dashboard", { username });
  } catch (error) {
    console.log("internal server error", error);
  }
});
// app.get("/", (req, res) => {
//   try {
//     res.send("Welcome to home page");
//   } catch (error) {
//     res.status(500).send({ message: error.message });
//   }
// });

app.listen(PORT, () => {
  console.log(`Server is started at PORT no ${PORT}`);
});
