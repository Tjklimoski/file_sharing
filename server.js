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
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index", { fileLink: req.query?.fileLink });
});

app.post("/upload", upload.single("file"), async (req, res) => {
  const fileData = {
    path: req.file.path,
    originalName: req.file.originalname,
  };

  // multer is letting us read req.body
  if (req.body.password != null && req.body.password !== "") {
    fileData.password = await bcrypt.hash(req.body.password, 10);
  }

  const file = await File.create(fileData);
  const query = querystring.stringify({
    fileLink: `${req.headers.origin}/file/${file.id}`,
  });
  res.redirect("/?" + query);
});

app.route("/file/:id").get(handleDownload).post(handleDownload);

async function handleDownload(req, res) {
  const file = await File.findById(req.params.id);

  if (file.password != null) {
    // here express.urlEncoded is letting us read req.body
    if (req.body.password == null) {
      res.render("password", { fileName: file.originalName });
      return;
    }

    if (!(await bcrypt.compare(req.body.password, file.password))) {
      res.render("password", { error: true });
      //we return in order to skip the code that would download the file to the user.
      return;
    }
  }
  file.downloadCount++;
  await file.save();

  res.download(file.path, file.originalName);
}

app.listen(port, (e) =>
  e ? console.error(e) : console.log(`app started on port ${port}`)
);
