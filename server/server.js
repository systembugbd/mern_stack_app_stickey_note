require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { logger, loggerEvent } = require("./middleware/logger");
const errorLogHandler = require("./middleware/errorLogHandler");
const connectDB = require("./config/dbConnection");

const app = express();
const PORT = process.env.PORT || 3500;

console.log(process.env.NODE_ENV);
connectDB();

//custome made middleware
app.use(logger);

app.use(cookieParser());

app.use(cors(require("./config/corsOptions")));

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

//Routes of Root
app.use("/", require("./routes/root"));
app.use("/user", require("./routes/usersRoutes"));

//Global Backend Host Error Handler
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Error, Resources not found" });
  } else {
    res.type("txt").send("404 Error, Resources not found");
  }
});

//Custome made ErrorLogHandler middleware
app.use(errorLogHandler);

//MongoDB connection once open create show message
mongoose.connection.once("open", () => {
  console.log("Mongodb Database is connected");
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

//MongoDB on error create log file in logs folder
mongoose.connection.on("error", (err) => {
  loggerEvent(`${err}`, "mongoError.log");
  console.table("connecting to MongoDB..., " + err);
});

//App port listning...
