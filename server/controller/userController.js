const User = require("../model/User");
const Note = require("../model/Note");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");

/**
 * @desc get All user
 * @param {request} req
 * @param {response} res
 * @return json response
 */
const getAllUser = asyncHandler(async (req, res) => {
  //find all User without password
  const user = await User.find().select("-password").lean().exec();

  //Check if User doesn't exists with optional chaining operator or have no length
  if (!user?.length) {
    return res.status(404).json({ message: "No User found" });
  }

  //finally send response with the user Object if user exists
  res.status(200).json(user);
});

/**
 * @desc get specific user by id
 * @param {request} req
 * @param {response} res
 * @return json response
 */
const getUserById = asyncHandler(async (req, res) => {
  //Destructure requied id from req.params
  const { id } = req.params;

  //Check valid mongodb id match with pattern /^[0-9a-fA-F]{24}$/ to avoid mongodb error
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    //find specific User without password and with extra method and exact match
    const user = await User.findById(id).select("-password").lean().exec();

    //Check, if User doesn't exists or user have no length
    if (!user && !user?.length) {
      return res.status(404).json({ message: "No User found" });
    }

    //finally send response with the user Object if user exists
    res.status(200).json(user);
  } else {
    //if ID is invalid and not match with pattern then send message
    return res.status(400).json({ message: "ID you provided is not valid" });
  }
});

/**
 * @desc post a user
 * @param {request} req
 * @param {response} res
 * @return json response
 */
const postUser = asyncHandler(async (req, res) => {
  //Destructure required info from req.body
  const { username, password, roles, active } = req.body;

  //Check basic Empty Validation
  if (
    !username ||
    !password ||
    !Array.isArray(roles) ||
    !roles.length ||
    !Boolean(active)
  ) {
    return res.status(400).json({ message: `All fields are required` });
  }

  //Check duplicate user is exists already or not
  const user = await User.find({ username }).lean().exec();
  if (user?.length) {
    return res.status(409).json({
      message: `Duplicate username found, ${user.username} is already exists`,
    });
  }

  //make password hash with salt 10 times
  const hashPassword = await bcrypt.hash(password, 10);

  //make complete user object with required data
  const userObject = {
    username,
    password: hashPassword,
    roles,
    active,
  };

  //create user in mongodb collection
  const result = await User.create(userObject);

  //finally send successfull response with created username
  res
    .status(201)
    .json({ message: `User ${result.username} created successfully` });
});

/**
 * @desc Patch a user
 * @param {request} req
 * @param {response} res
 * @return json response
 */
const patchUser = asyncHandler(async (req, res) => {
  //Destructure all required info from req.body
  const { id, username, password, roles, active } = req.body;

  //Simple !Empty validation
  if (!id) {
    return res.status(400).json({ message: "Id is required" });
  }

  //Check valid mongodb id match with pattern /^[0-9a-fA-F]{24}$/ to avoid mongodb error
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    const user = await User.findById(id).select("-password").exec();
    if (!user && !user?.length) {
      return res.status(404).json({ message: "No User found" });
    }

    //duplicate user check find with username and without password and method with exact match
    const userDuplicate = await User.find({ username })
      .select("-password")
      .lean()
      .exec();
    if (userDuplicate && userDuplicate.length) {
      return res.status(409).json({
        message: "Username already exists in database, please change username",
      });
    }

    //basic validation with existance and setting to user object
    if (username || roles || active || password) {
      user.username = username;
      user.roles = roles;
      user.active = active;
    }

    //Check Password is exists then make it hash with bcrypt and set to user object
    if (password) {
      const hashPasswrod = await bcrypt.hash(password, 10);
      user.password = hashPasswrod;
    }

    //save user object
    user.save();

    //finally send message with updated user data
    res.status(200).json({
      message: `${username}'s info successfully updated`,
      updatedUser: user,
    });
  } else {
    //if ID is invalid and not match with pattern then send message
    return res.status(400).json({ message: "ID you provided is not valid" });
  }
});

/**
 * @desc Delete a user
 * @param {request} req
 * @param {response} res
 * @return json response
 */
const deletehUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  //Check valid mongodb id match with pattern /^[0-9a-fA-F]{24}$/ to avoid mongodb error
  if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
    const user = await User.findById(id).select("-password").exec();

    if (!user && !user?.length) {
      return res.status(404).json({ message: "No User found" });
    }

    const note = await Note.find({ user: id }).lean().exec();

    if (note && note?.length) {
      return res
        .status(400)
        .json({ message: "This user associated with note", Note: note });
    }
    const result = await user.deleteOne();

    if (result) {
      res.status(200).json({
        message: `${result.username}'s info successfully deleted`,
      });
    }
  } else {
    //if ID is invalid and not match with pattern then send message
    return res.status(400).json({ message: "ID you provided is not valid" });
  }
});

module.exports = {
  getAllUser,
  getUserById,
  postUser,
  patchUser,
  deletehUser,
};
