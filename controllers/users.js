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

const getUsers = (req, res) => {
  User.find({})
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      res
        .status(SERVER_ERROR_CODE)
        .send({ message: "An error has occurred on the server." });
    });
};

const createUser = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(BAD_REQUEST_ERROR_CODE)
      .send({ message: "Email and password are required" });
  }
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      return User.create({
        name: req.body.name,
        avatar: req.body.avatar,
        email: req.body.email,
        password: hash,
      });
    })

    .then((user) => {
      const userObj = user.toObject();
      delete userObj.password;
      return res.status(201).send(userObj);
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 11000) {
        res
          .status(CONFLICT_ERROR_CODE)
          .send({ message: "Email already exists." });
      } else if (err.name === "ValidationError") {
        res.status(BAD_REQUEST_ERROR_CODE).send({ message: "Invalid user ID" });
      } else {
        res
          .status(SERVER_ERROR_CODE)
          .send({ message: "An error has occurred on the server." });
      }
    });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: "User not found" });
      } else if (err.name === "CastError") {
        res.status(BAD_REQUEST_ERROR_CODE).send({ message: "Invalid user ID" });
      } else {
        res
          .status(SERVER_ERROR_CODE)
          .send({ message: "An error has occurred on the server." });
      }
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
        res.status(NOT_FOUND_ERROR_CODE).send({ message: "User not found" });
      } else {
        res.status(200).send(user);
      }
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        res.status(BAD_REQUEST_ERROR_CODE).send({ message: "Invalid user ID" });
      } else {
        res
          .status(SERVER_ERROR_CODE)
          .send({ message: "An error has occurred on the server." });
      }
    });
};

module.exports = { getUsers, createUser, getCurrentUser, login, updateProfile };
