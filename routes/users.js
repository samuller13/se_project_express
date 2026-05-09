const router = require("express").Router();
const { validateUserUpdate } = require("../middlewares/validation");
const { getCurrentUser, updateProfile } = require("../controllers/users");
const auth = require("../middlewares/auth");

router.use(auth);
router.get("/me", getCurrentUser);
router.patch("/me", validateUserUpdate, updateProfile);

module.exports = router;
