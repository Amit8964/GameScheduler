const { send_email, send_template_email } = require("../utils/email");
const CustomError = require("../lib/customError");

const crypto = require("crypto");

const generateOtp = () => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
  } catch (err) {
    throw err;
  }
};

const sendOtp = async (email, otp) => {
  try {
    if (await send_template_email(email, "Do not share Otp", "otp", { otp })) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    throw err;
  }
};

module.exports = {
  generateOtp,
  sendOtp,
};
