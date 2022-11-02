const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { logger } = require("./middleware/logger");
const errorLogHandler = require("./middleware/errorLogHandler");

const app = express();
const PORT = process.env.PORT || 3500;

//custome made middleware
app.use(logger);

app.use(cookieParser());

app.use(cors(require("./config/corsOptions")));

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

//Routes of Root
app.use("/", require("./routes/root"));

//Error Handler
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
//Error Log Handler middleware
app.use(errorLogHandler);

//App port listning...
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
