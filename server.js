import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import File from "./models/File.js";
import querystring from "node:querystring";
dotenv.config();

const port = process.env.PORT || 3000;
const app = express();
const upload = multer({ dest: "uploads" });

mongoose.connect(process.env.DB_URL);

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index", { fileLink: req.query?.fileLink });
});

app.post("/upload", upload.single("file"), async (req, res) => {
  const fileData = {
    path: req.file.path,
    originalName: req.file.originalname,
  };

  if (req.body.password != null && req.body.password !== "") {
    fileData.password = await bcrypt.hash(req.body.password, 10);
  }

  const file = await File.create(fileData);
  const query = querystring.stringify({
    fileLink: `${req.headers.origin}/file/${file.id}`,
  });
  res.redirect("/?" + query);
});

app.get("/file/:id", async (req, res) => {
  const file = await File.findById(req.params.id);

  file.downloadCount++;
  await file.save();

  res.download(file.path, file.originalName);
});

app.listen(port, (e) =>
  e ? console.error(e) : console.log(`app started on port ${port}`)
);
