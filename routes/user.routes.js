const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getProfile,
  updateProfile,
  deleteUser,
} = require("../controllers/user.controller");

const { protect, authorize } = require("../middlewares/auth.middleware");

router.use(protect);

router.get("/", authorize(["admin"]), getAllUsers);
router.get("/me", getProfile);
router.put("/me", updateProfile);
router.delete("/:id", authorize(["admin"]), deleteUser); 

module.exports = router;
