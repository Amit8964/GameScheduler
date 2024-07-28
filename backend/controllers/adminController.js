const Admin = require("../models/admin");
const services = require("../services/services");
const { generateOtp, sendOtp } = require("../lib/otpLib");
const { generateToken } = require("../middlewares/authMiddleware");
const Wallet = require("../models/wallet");
const CustomError = require("../lib/customError");
const validateFields = require("../validators/validateFields");
const {
  generateHashPassword,
  compareHashPassword,
} = require("../utils/bcryptHash");
