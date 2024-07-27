const User = require("../models/user");
const services = require("../services/services");
const { generateOtp, sendOtp } = require("../lib/otpLib");
const { generateToken } = require("../middlewares/authMiddleware");
const Wallet = require("../models/wallet");
const CustomError = require("../lib/customError");
const {
  generateHashPassword,
  compareHashPassword,
} = require("../utils/bcryptHash");

const validateFields = async (payloadData, allowedFields, invalid, missing) => {
  try {
    const payloadFields = Object.keys(payloadData);

    if (invalid) {
      const invalidFields = payloadFields.filter(
        (field) => !allowedFields.includes(field)
      );

      if (invalidFields.length > 0) {
        throw new CustomError(
          `Invalid fields: ${invalidFields.join(", ")}`,
          501
        );
      }
    }

    if (missing) {
      const missingFields = allowedFields.filter(
        (field) => !payloadFields.includes(field)
      );

      if (missingFields.length > 0) {
        throw new CustomError(
          `Missing required fields: ${missingFields.join(", ")}`,
          400
        );
      }
    }
  } catch (err) {
    throw err;
  }
};

const registerUser = async (req, res, next) => {
  try {
    let payloadData = req.body;
    let userData = await User.findOne({ email: payloadData.email });
    if (userData && userData.is_verified) {
      res.status(409).json({
        success: false,
        message: "User allready exist ",
      });
    } else {
      let allowedFields = ["name", "phone", "email", "password"]; // keep remember

      await validateFields(payloadData, allowedFields, true, true);
      const hashPassword = await generateHashPassword(payloadData.password);
      payloadData.password = hashPassword;
      payloadData.otp = generateOtp();
      payloadData.otp_expire_in = new Date(Date.now() + 10 * 60000);
      //can not send is_verified field
      let result;
      if (userData) {
        // will have to work here
        result = await services.findAndUpdate(
          User,
          { email: userData.email },
          payloadData
        );
      } else {
        result = await services.saveData(User, payloadData);
      }

      if (result) {
        await sendOtp(result.email, result.otp);

        res
          .status(200)
          .json({ success: true, message: "otp send successfully" });
      }
    }
  } catch (err) {
    next(err);
  }
};

const verifyUser = async (req, res, next) => {
  try {
    let payloadData = req.body;
    let allowedFields = ["email", "phone", "otp"];
    await validateFields(payloadData, allowedFields, true, true);

    let userData = await User.findOne({ email: payloadData.email });
    if (userData) {
      if (userData.otp_expire_in >= Date.now()) {
        if (userData.otp == payloadData.otp) {
          let walletData = new Wallet({
            user_id: userData._id,
            balance: 0,
          });
          let walletResult = await walletData.save();
          if (walletResult) {
            userData.is_verified = true;
            userData.wallet_id = walletResult._id;
            await userData.save();

            res.status(201).json({ message: "User Resitered successfully" });
          }
        } else {
          throw new CustomError("Otp did't match please try again", 401);
        }
      } else {
        throw new CustomError("Otp expired", 410);
      }
    } else {
      throw new CustomError("User Not found", 404);
    }
  } catch (err) {
    if (!err.priority) {
      error = new CustomError("Internal server error", 500, "HIGH");
    }
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const payloadData = req.body;
    const allowedFields = ["email", "password"];
    await validateFields(payloadData, allowedFields, true, true);
    let userData = await services.findOne(User, { email: payloadData.email });
    if (userData) {
      const compareResult = await compareHashPassword(
        payloadData.password, //created an error
        userData.password
      );
      if (compareResult) {
        const token = await generateToken({
          id: userData._id,
          email: userData.email,
          walletId: userData.wallet_id,
          role: "user",
        });
        res.status(200).json({
          success: true,
          message: "User logged in successfully",
          token,
        });
      } else {
        throw new CustomError("Password did't match", 401);
      }
    } else {
      throw new CustomError("User does not exist", 404);
    }
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    let payloadData = req.body;
    const allowedFields = ["email"];
    await validateFields(payloadData, allowedFields, true, true);
    let userData = await services.findOne(User, { email: payloadData.email });
    if (userData) {
      let otp = await generateOtp();
      await sendOtp(userData.email, otp);
      userData.otp = otp;
      userData.otp_expire_in = new Date(Date.now() + 10 * 60000);
      await userData.save();
      res.status(200).json({
        success: true,
        message: "Otp has been send to " + `${userData.email}`,
      });
    } else {
      throw new CustomError("User not found", 404);
    }
  } catch (err) {
    next(err);
  }
};

const otpMatchForReset = async (req, res, next) => {
  try {
    let payloadData = req.body;
    const allowedFields = ["email", "otp"];
    await validateFields(payloadData, allowedFields, true, true);
    let userData = await services.findOne(User, { email: payloadData.email });
    if (userData) {
      if (userData.otp_expire_in >= Date.now()) {
        if (userData.otp == payloadData.otp) {
          //think about it
          const resetToken = await generateToken({
            id: userData._id,
            email: userData.email,
          });
          res.status(200).json({
            success: true,
            message: "Reset your password",
            resetToken,
          });
        } else {
          throw new CustomError("Otp did`t match", 404);
        }
      } else {
        throw new CustomError("Otp is Expired", 410);
      }
    } else {
      throw new CustomError("User not found", 404);
    }
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    let payloadData = req.body;
    let email = req.user.email;
    const allowedFields = ["password"];
    await validateFields(payloadData, allowedFields, true, true);
    let hashPassword = await generateHashPassword(payloadData.password);
    let userData = await services.findAndUpdate(
      User,
      { email: email },
      { password: hashPassword }
    );
    if (userData) {
      res
        .status(200)
        .json({ success: true, message: "paasword reset successfully" });
    } else {
      throw new CustomError(
        "Somthing went wrong",
        500,
        "HIGH",
        "resetPassword"
      );
    }
  } catch (err) {
    next(err);
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const userData = await services.findOne(
      User,
      { _id: userId },
      { name: true, phone: true, email: true }
    );

    if (userData) {
      res.status(200).json({ success: true, payloadData: userData });
    } else {
      throw new CustomError("User not found", 404);
    }
  } catch (err) {
    next(err);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    let payloadData = req.body;
    const allowedFields = ["name", "email", "phone", "password", "oldPassword"];
    await validateFields(payloadData, allowedFields, true);

    let userId = req.user.id;
    let userEmail = req.user.email;

    if (payloadData.password) {
      await validateFields(
        payloadData,
        ["password", "oldPassword"],
        true,
        true
      );
      let userData = await services.findOne(User, { _id: userId });

      if (
        await compareHashPassword(payloadData.oldPassword, userData.password)
      ) {
        userData.password = await generateHashPassword(payloadData.password);
        await userData.save();
        res
          .status(201)
          .json({ success: true, message: "Password updated successfully" });
      } else {
        res.status(404).json({
          success: false,
          message: "Old password did`t match try to forgot your password",
        });
      }
    } else {
      let userData = await services.findByIdAndUpdate(
        User,
        userId,
        payloadData,
        {
          new: true,
          fields: { name: true, email: true, phone: true },
        }
      );
      let token = await generateToken({
        id: userData._id,
        email: userData.email,
        walletId: userData.wallet_id,
        role: "user",
      });
      if (userData) {
        res.status(201).json({
          success: true,
          message: "Profile Updated successfully",
          payloadData: userData,
          token,
        });
      } else {
        throw new CustomError("User not found", 404);
      }
    }
  } catch (err) {
    next(err);
  }
};

const getUserWalletBalance = async (req, res) => {
  try {
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  verifyUser,
  loginUser,
  forgotPassword,
  otpMatchForReset,
  resetPassword,
  getUserProfile,
  updateUserProfile,
};
