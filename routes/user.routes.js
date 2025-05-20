const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getProfile,
  updateProfile,
  deleteUser,
} = require("../controllers/user.controller");

const { protect, authorize } = require("../middlewares/auth.middleware");

router.use(protect); // all below need login

router.get("/", authorize(["admin"]), getAllUsers); // admin only
router.get("/me", getProfile);
router.put("/me", updateProfile);
router.delete("/:id", authorize(["admin"]), deleteUser); // admin only

module.exports = router;
