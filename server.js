import express from "express";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.set("view-engine", "ejs");

app.get("/", (req, res) => {
  res.send("home page");
});

app.listen(port, (e) =>
  e ? console.error(e) : console.log(`app started on port ${port}`)
);
