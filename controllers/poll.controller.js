const Poll = require("../models/Poll");
const User = require("../models/User");
const { success, error } = require("../utils/response");

exports.createPoll = async (req, res) => {
  try {
    const { title, description, options, expiresAt } = req.body;

    if (!Array.isArray(options) || options.length < 2) {
      return error(res, "Poll must have at least 2 options");
    }

    const poll = await Poll.create({
      title,
      description,
      options: options.map((text) => ({ text })),
      creator: req.user._id,
      expiresAt,
    });

    success(res, "Poll created successfully", { poll });
  } catch (err) {
    error(res, err.message);
  }
};

exports.getAllPolls = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const total = await Poll.countDocuments();
    const polls = await Poll.find()
      .populate("creator", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    polls.forEach((poll) => {
      poll.votesCount = poll.options.reduce(
        (sum, o) => sum + o.userVote.length,
        0
      );
    });

    success(res, "Get all Poll successfully", {
      polls,
      total,
      page,
      limit,
    });
  } catch (err) {
    error(res, err.message);
  }
};

exports.getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .populate("creator", "username")
      .populate("options.userVote", "username")
      .lean();

    if (!poll) return error(res, "Poll not found", 404);

    const totalVotes = poll.options.reduce(
      (sum, o) => sum + o.userVote.length,
      0
    );
    poll.totalVotes = totalVotes;

    // Optional: set each option votes count
    poll.options = poll.options.map((opt) => ({
      ...opt,
      votes: opt.userVote.length,
    }));

    success(res, "Get Poll successfully", poll);
  } catch (err) {
    error(res, err.message);
  }
};

exports.updatePoll = async (req, res) => {
  try {
    const updated = await Poll.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    success(res, "Poll updated successfully", { poll: updated });
  } catch (err) {
    error(res, err.message);
  }
};

exports.deletePoll = async (req, res) => {
  try {
    await Poll.findByIdAndDelete(req.params.id);
    success(res, "Poll deleted successfully");
  } catch (err) {
    error(res, err.message);
  }
};

exports.votePoll = async (req, res) => {
  try {
    const { optionId } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) return error(res, "Poll not found", 404);
    if (poll.isLocked) return error(res, "Poll is locked", 403);

    // Check expiration
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return error(res, "Poll has expired", 403);
    }

    // Check if user already voted
    for (let opt of poll.options) {
      if (opt.userVote.includes(req.user._id)) {
        return error(res, "You have already voted");
      }
    }

    const option = poll.options.id(optionId);
    if (!option) return error(res, "Option not found", 404);

    option.userVote.push(req.user._id);
    // Optional: Update votes count field if you keep it
    option.votes = option.userVote.length;

    await poll.save();

    const updatedPoll = await Poll.findById(poll._id)
      .populate("creator", "username")
      .populate("options.userVote", "username");

    success(res, "Vote successful", { poll: updatedPoll });
  } catch (err) {
    error(res, err.message);
  }
};

exports.unvotePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return error(res, "Poll not found", 404);

    for (let opt of poll.options) {
      opt.userVote = opt.userVote.filter(
        (uid) => uid.toString() !== req.user._id.toString()
      );
      opt.votes = opt.userVote.length;
    }

    await poll.save();

    const updatedPoll = await Poll.findById(poll._id)
      .populate("creator", "username")
      .populate("options.userVote", "username");

    success(res, "Unvote successful", { poll: updatedPoll });
  } catch (err) {
    error(res, err.message);
  }
};

exports.lockPoll = async (req, res) => {
  try {
    const poll = await Poll.findByIdAndUpdate(
      req.params.id,
      { isLocked: true },
      { new: true }
    );
    success(res, "Poll locked", { poll });
  } catch (err) {
    error(res, err.message);
  }
};

exports.unlockPoll = async (req, res) => {
  try {
    const poll = await Poll.findByIdAndUpdate(
      req.params.id,
      { isLocked: false },
      { new: true }
    );
    success(res, "Poll unlocked", { poll });
  } catch (err) {
    error(res, err.message);
  }
};

exports.addOption = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return error(res, "Poll not found", 404);

    if (!req.body.text || typeof req.body.text !== "string") {
      return error(res, "Option text is required");
    }

    poll.options.push({ text: req.body.text });
    await poll.save();

    success(res, "Option added", { poll });
  } catch (err) {
    error(res, err.message);
  }
};

exports.removeOption = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return error(res, "Poll not found", 404);

    const option = poll.options.id(req.params.optionId);
    if (!option) return error(res, "Option not found", 404);

    option.remove();
    await poll.save();

    success(res, "Option removed", { poll });
  } catch (err) {
    error(res, err.message);
  }
};
