const User = require("../models/User");
const { success, error } = require("../utils/response");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    success(res, "Get all users successfully", { users });
  } catch (err) {
    error(res, err.message);
  }
};

exports.getProfile = (req, res) => {
  success(res, "Get profile successfully", { user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");
    success(res, "Update profile successfully", { user: updatedUser });
  } catch (err) {
    error(res, err.message);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    success(res, "Delete user successfully");
  } catch (err) {
    error(res, err.message);
  }
};
