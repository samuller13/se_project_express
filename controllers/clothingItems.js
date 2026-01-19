const ClothingItem = require("../models/clothingItem");
const {
  BAD_REQUEST_ERROR_CODE,
  NOT_FOUND_ERROR_CODE,
  SERVER_ERROR_CODE,
  FORBIDDEN_ERROR_CODE,
} = require("../utils/errors");

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;
  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => res.status(201).send(item))
    .catch((err) => {
      if (err.name === "ValidationError") {
        res
          .status(BAD_REQUEST_ERROR_CODE)
          .send({ message: "Invalid item data" });
      } else {
        res
          .status(SERVER_ERROR_CODE)
          .send({ message: "An error has occurred on the server." });
      }
    });
};

const getItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: "Item not found" });
      } else if (err.name === "CastError") {
        res.status(BAD_REQUEST_ERROR_CODE).send({
          message: "Invalid request parameters",
        });
      } else {
        res
          .status(SERVER_ERROR_CODE)
          .send({ message: "An error has occurred on the server." });
      }
    });
};

const deleteItem = (req, res) => {
  const { id } = req.params;
  ClothingItem.findById(id)
    .orFail()
    .then((item) => {
      if (!item.owner) {
        return res
          .status(BAD_REQUEST_ERROR_CODE)
          .send({ message: "Item has no owner information" });
      }
      if (item.owner.toString() !== req.user._id.toString()) {
        return res
          .status(FORBIDDEN_ERROR_CODE)
          .send({ message: "Access denied" });
      }
      return ClothingItem.findByIdAndDelete(id).then(() => {
        res.status(200).send({ message: "Item deleted successfully" });
      });
    })

    .catch((err) => {
      if (err.name === "CastError") {
        res.status(BAD_REQUEST_ERROR_CODE).send({ message: "Invalid item ID" });
      } else if (err.name === "DocumentNotFoundError") {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: "Item not found" });
      } else {
        res
          .status(SERVER_ERROR_CODE)
          .send({ message: "An error has occurred on the server." });
      }
    });
};

const likeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => res.status(201).send(item))
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(BAD_REQUEST_ERROR_CODE).send({ message: "Invalid item ID" });
      } else if (err.name === "DocumentNotFoundError") {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: "Item not found" });
      } else {
        res
          .status(SERVER_ERROR_CODE)
          .send({ message: "An error has occurred on the server." });
      }
    });
};

const dislikeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => res.status(200).send(item))
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(BAD_REQUEST_ERROR_CODE).send({ message: "Invalid item ID" });
      } else if (err.name === "DocumentNotFoundError") {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: "Item not found" });
      } else {
        res
          .status(SERVER_ERROR_CODE)
          .send({ message: "An error has occurred on the server." });
      }
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
