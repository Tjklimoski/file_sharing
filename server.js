import express from "express";
import dotenv from "dotenv";
import multer from "multer";
dotenv.config();

const port = process.env.PORT || 3000;
const app = express();
const upload = multer({ dest: "uploads" });

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", upload.single("file"), (req, res) => {
  res.send("sup");
});

app.listen(port, (e) =>
  e ? console.error(e) : console.log(`app started on port ${port}`)
);
