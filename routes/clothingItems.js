const router = require("express").Router();

const {
  createItem,
  getItems,
  deleteItem,
  dislikeItem,
  likeItem,
} = require("../controllers/clothingItems");

router.post("/", createItem);
router.get("/", getItems);
router.delete("/:id", deleteItem);
router.put("/:id/likes", likeItem);
router.delete("/:id/likes", dislikeItem);

module.exports = router;
