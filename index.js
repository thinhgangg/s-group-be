import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("<a href='/about-me'>About Me</a>");
});

app.get("/about-me", (req, res) => {
  res.send("<a href='/'>Back to Home</a>");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
