const router = require("express").Router();
const itemRouter = require("./clothingItems");
const userRouter = require("./users");

router.use("/items", itemRouter);
router.use("/users", userRouter);

router.use((req, res) => {
  res.status(500).send({ message: "Requested resource not found." });
});

module.exports = router;
