const router = require("express").Router();
const auth = require("../middlewares/auth");

const {
  createItem,
  getItems,
  deleteItem,
  dislikeItem,
  likeItem,
} = require("../controllers/clothingItems");

router.get("/", getItems);
router.use(auth);
router.post("/", createItem);
router.delete("/:id", deleteItem);
router.put("/:id/likes", likeItem);
router.delete("/:id/likes", dislikeItem);

module.exports = router;
