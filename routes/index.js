const router = require("express").Router();
const {
  validateAuthentication,
  validateUserRegistration,
} = require("../middlewares/validation");
const itemRouter = require("./clothingItems");
const userRouter = require("./users");
const { NOT_FOUND_ERROR_CODE } = require("../utils/errors");
const { createUser, login } = require("../controllers/users");

router.post("/signin", validateAuthentication, login);
router.post("/signup", validateUserRegistration, createUser);

router.use("/items", itemRouter);
router.use("/users", userRouter);

router.use((req, res) => {
  res
    .status(NOT_FOUND_ERROR_CODE)
    .send({ message: "Requested resource not found." });
});

module.exports = router;
