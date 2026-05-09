const router = require("express").Router();
const auth = require("../middlewares/auth");

const {
  validateId,
  validateCardBody,
  validateHeaders,
} = require("../middlewares/validation");

const {
  createItem,
  getItems,
  deleteItem,
  dislikeItem,
  likeItem,
} = require("../controllers/clothingItems");

router.get("/", getItems);
router.use(auth);
router.post("/", validateCardBody, createItem);
router.delete("/:id", validateId, validateHeaders, deleteItem);
router.put("/:id/likes", validateId, validateHeaders, likeItem);
router.delete("/:id/likes", validateId, validateHeaders, dislikeItem);

module.exports = router;
