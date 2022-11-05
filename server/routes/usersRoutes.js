const express = require("express");
const router = express.Router();
const {
  getAllUser,
  postUser,
  patchUser,
  deletehUser,
  getAllUserById,
} = require("./../controller/userController");

router
  .get("/", getAllUser)
  .get("/:id", getAllUserById)
  .post("/", postUser)
  .patch("/", patchUser)
  .delete("/", deletehUser);

module.exports = router;
