const express = require("express");
const router = express.Router();
const {
  getAllPolls,
  getPollById,
  createPoll,
  updatePoll,
  deletePoll,
  lockPoll,
  unlockPoll,
  addOption,
  removeOption,
  votePoll, // Sửa từ vote thành votePoll
  unvotePoll, // Sửa từ unvote thành unvotePoll
} = require("../controllers/poll.controller");

const { protect, authorize } = require("../middlewares/auth.middleware");

router.use(protect);

// Public for logged-in users
router.get("/", getAllPolls);
router.get("/:id", getPollById);

// Admin only
router.post("/", authorize(["admin"]), createPoll);
router.put("/:id", authorize(["admin"]), updatePoll);
router.delete("/:id", authorize(["admin"]), deletePoll);
router.patch("/:id/lock", authorize(["admin"]), lockPoll);
router.patch("/:id/unlock", authorize(["admin"]), unlockPoll);
router.post("/:id/options", authorize(["admin"]), addOption);
router.delete("/:pollId/options/:optionId", authorize(["admin"]), removeOption);

// User vote
router.post("/:pollId/vote/:optionId", authorize(["user"]), votePoll); // Sửa vote thành votePoll
router.post("/:pollId/unvote/:optionId", authorize(["user"]), unvotePoll); // Sửa unvote thành unvotePoll

module.exports = router;
