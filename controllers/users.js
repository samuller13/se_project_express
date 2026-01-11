const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../utils/config");

const User = require("../models/user");
const {
  BAD_REQUEST_ERROR_CODE,
  NOT_FOUND_ERROR_CODE,
  SERVER_ERROR_CODE,
  CONFLICT_ERROR_CODE,
  UNAUTHORIZED_ERROR_CODE,
} = require("../utils/errors");

const createUser = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(BAD_REQUEST_ERROR_CODE)
      .send({ message: "Email and password are required" });
  }
  return bcrypt
    .hash(req.body.password, 10)
    .then((hash) =>
      User.create({
        name: req.body.name,
        avatar: req.body.avatar,
        email: req.body.email,
        password: hash,
      })
    )

    .then((user) => {
      const userObj = user.toObject();
      delete userObj.password;
      return res.status(201).send(userObj);
    })
    .catch((err) => {
      if (err.code === 11000) {
        return res
          .status(CONFLICT_ERROR_CODE)
          .send({ message: "Email already exists." });
      }
      if (err.name === "ValidationError") {
        return res
          .status(BAD_REQUEST_ERROR_CODE)
          .send({ message: "Invalid user ID" });
      }
      return res
        .status(SERVER_ERROR_CODE)
        .send({ message: "An error has occurred on the server." });
    });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: "User not found" });
      }
      if (err.name === "CastError") {
        return res
          .status(BAD_REQUEST_ERROR_CODE)
          .send({ message: "Invalid user ID" });
      }
      return res
        .status(SERVER_ERROR_CODE)
        .send({ message: "An error has occurred on the server." });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(BAD_REQUEST_ERROR_CODE)
      .send({ message: "Email and password are required" });
  }
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      res.status(UNAUTHORIZED_ERROR_CODE).send({ message: err.message });
    });
};

const updateProfile = (req, res) => {
  const userId = req.user._id;
  const allowedFields = {};
  if (req.body.name !== undefined) {
    allowedFields.name = req.body.name;
  }
  if (req.body.avatar !== undefined) {
    allowedFields.avatar = req.body.avatar;
  }

  User.findByIdAndUpdate(userId, allowedFields, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) {
        return res
          .status(NOT_FOUND_ERROR_CODE)
          .send({ message: "User not found" });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res
          .status(BAD_REQUEST_ERROR_CODE)
          .send({ message: "Invalid user ID" });
      }
      return res
        .status(SERVER_ERROR_CODE)
        .send({ message: "An error has occurred on the server." });
    });
};

module.exports = { createUser, getCurrentUser, login, updateProfile };
