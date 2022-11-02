const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

/**
 * @desc loggerEvent fn is for making log file for each event in client side
 * @param {message} message sent for log the message
 * @param {filename} filename to create the log file with the name if not exits or append message
 */
const loggerEvent = async (
  message = "No message provided",
  filename = "defaultLog.log"
) => {
  const dateTime = format(new Date(), "yyyy-MM-dd\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", filename),
      logItem
    );
  } catch (error) {
    console.log(error.message);
  }
};

/**
 * logger is middleware, using loggerEvent fn to generate the logs
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */
const logger = (req, res, next) => {
  loggerEvent(
    `${req.method}\t${req.url}\t${req.headers.origin}\t${req.socket.remoteAddress}\t${req.headers["sec-ch-ua-platform"]}\t${req.headers["user-agent"]}\n`,
    "reqLog.log"
  );
  console.log(
    `${format(new Date(), "yyyy-MM-dd\tHH:mm:ss")}\t${req.method}\t${
      req.url
    }\t${req.headers.origin}\t${req.socket.remoteAddress}\t${
      req.headers["sec-ch-ua-platform"]
        ? req.headers["sec-ch-ua-platform"]
        : req.headers["If-None-Match"]
    } \t${req.headers["user-agent"]}`
  );
  next();
};

module.exports = { loggerEvent, logger };
