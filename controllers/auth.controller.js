const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { success, error } = require("../utils/response");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return error(res, "Email already exists");

    const newUser = await User.create({ username, email, password, role });
    const token = generateToken(newUser);
    success(res, "User registered successfully", {
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    error(res, err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return error(res, "Invalid email or password", 401);
    }

    const token = generateToken(user);
    success(res, "Login successful", {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    error(res, err.message);
  }
};
