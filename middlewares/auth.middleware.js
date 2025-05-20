const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { error } = require("../utils/response");

exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return error(res, "Unauthorized", 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    error(res, "Invalid token", 401);
  }
};

exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return error(
        res,
        "Forbidden: You are not allowed to access this resource",
        403
      );
    }
    next();
  };
};
