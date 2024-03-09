const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
// require('dotenv').config();

const placeRouter = require("./routes/places-route");
const usersRouter = require("./routes/user-route");

const app = express();

app.use(bodyParser.json());
app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use(cors());
app.use("/api/users", usersRouter);
app.use("/api/places", placeRouter);

app.use((req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path);
  }
  res.status(404).json({ message: "Can not find this route" });
  next();
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD)}@cluster0.m9ddkh2.mongodb.net/${
      process.env.DB_NAME
    }?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    app.listen(5000, () => {
      console.log("server is up and running...");
    });
  })
  .catch((error) => {
    console.log(error);
  });
