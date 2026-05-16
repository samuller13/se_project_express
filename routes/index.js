const router = require("express").Router();
const {
  validateAuthentication,
  validateUserRegistration,
} = require("../middlewares/validation");
const itemRouter = require("./clothingItems");
const userRouter = require("./users");

const { createUser, login } = require("../controllers/users");
const NotFoundError = require("../errors/not-found-err");

router.post("/signin", validateAuthentication, login);
router.post("/signup", validateUserRegistration, createUser);

router.use("/items", itemRouter);
router.use("/users", userRouter);

router.use((req, res, next) => {
  next(new NotFoundError("Requested resource not found."));
});

module.exports = router;
