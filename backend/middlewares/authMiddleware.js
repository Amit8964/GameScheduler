const jwt = require("jsonwebtoken");
const CustomError = require("../lib/customError");
const services = require("../services/services");
const Admin = require("../models/admin");
const User = require("../models/user");
require("dotenv").config();

const generateToken = async (data) => {
  /*
data:{
    _id:
    email:
    wallet_id:
}
    */
  try {
    let token = await jwt.sign(data, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });
    return token;
  } catch (err) {
    throw err;
  }
};

const decodeToken = async (token) => {
  try {
    let result = await jwt.decode(token);
    return result;
  } catch (err) {
    throw err;
  }
};

const verifyUserToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if the authorization header is provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization token missing or malformed" });
    }

    // Extract the token from the authorization header
    const token = authHeader.split(" ")[1];

    // Verify the token
    const result = await jwt.verify(token, process.env.JWT_SECRET);
    console.log(result);
    req.user = result;
    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    switch (err.name) {
      case "TokenExpiredError":
        return res
          .status(401)
          .json({ message: "Token has expired. Please re-authenticate." });
      case "JsonWebTokenError":
        return res
          .status(401)
          .json({ message: "Invalid token. Please provide a valid token." });
      case "NotBeforeError":
        return res.status(401).json({ message: "Token is not valid yet." });
      default:
        next(err);
    }
  }
};

const verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if the authorization header is provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization token missing or malformed" });
    }

    // Extract the token from the authorization header
    const token = authHeader.split(" ")[1];

    // Verify the token
    const result = await jwt.verify(token, process.env.JWT_SECRET);
    const userData = await services.findOne(Admin, { email: result.email });
    if (userData) {
      req.user = result;
      next();
    } else {
      console.log(userData);
      throw new CustomError("Unauthorised access to the route", 410);
    }
    // Proceed to the next middleware/route handler
  } catch (err) {
    switch (err.name) {
      case "TokenExpiredError":
        return res
          .status(401)
          .json({ message: "Token has expired. Please re-authenticate." });
      case "JsonWebTokenError":
        return res
          .status(401)
          .json({ message: "Invalid token. Please provide a valid token." });
      case "NotBeforeError":
        return res.status(401).json({ message: "Token is not valid yet." });
      default:
        next(err);
    }
  }
};

const verifyPasswordReset = async (req, res, next) => {
  try {
    const resetToken = req.params.token;
    if (resetToken) {
      let result = await jwt.verify(resetToken, process.env.JWT_SECRET);
      if (result) {
        req.user = { email: result.email };
        next();
      }
    } else {
      throw new CustomError("Token not found", 404);
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateToken,
  verifyUserToken,
  decodeToken,
  verifyPasswordReset,
  verifyAdminToken,
};
