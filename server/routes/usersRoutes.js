const express = require("express");
const router = express.Router();
const {
  getAllUser,
  postUser,
  patchUser,
  deletehUser,
  getUserById,
} = require("./../controller/userController");

router
  .get("/", getAllUser)
  .get("/:id", getUserById)
  .post("/", postUser)
  .patch("/", patchUser)
  .delete("/", deletehUser);

module.exports = router;
