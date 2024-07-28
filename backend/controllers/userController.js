const User = require("../models/user");
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

// const validateFields = async (payloadData, allowedFields, invalid, missing) => {
//   try {
//     const payloadFields = Object.keys(payloadData);

//     if (invalid) {
//       const invalidFields = payloadFields.filter(
//         (field) => !allowedFields.includes(field)
//       );

//       if (invalidFields.length > 0) {
//         throw new CustomError(
//           `Invalid fields: ${invalidFields.join(", ")}`,
//           501
//         );
//       }
//     }

//     if (missing) {
//       const missingFields = allowedFields.filter(
//         (field) => !payloadFields.includes(field)
//       );

//       if (missingFields.length > 0) {
//         throw new CustomError(
//           `Missing required fields: ${missingFields.join(", ")}`,
//           400
//         );
//       }
//     }
//   } catch (err) {
//     throw err;
//   }
// };

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
    let allowedFields = ["email", "otp"];
    await validateFields(payloadData, allowedFields, true, true);

    let userData = await User.findOne({ email: payloadData.email });

    if (userData) {
      if (userData.is_blocked) {
        throw new CustomError("Account is blocked", 403);
      }
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
    let responseData;
    const payloadData = req.body;
    const allowedFields = ["email", "password"];
    await validateFields(payloadData, allowedFields, true, true);
    let userData = await services.findOne(User, { email: payloadData.email });

    if (userData) {
      if (userData.is_blocked) {
        throw new CustomError("Account is blocked", 403);
      }
      const compareResult = await compareHashPassword(
        payloadData.password, //created an error
        userData.password
      );
      if (compareResult) {
        const token = await generateToken({
          id: userData._id,
          email: userData.email,
          wallet_id: userData.wallet_id,
          role: "user",
        });
        responseData = {
          id: userData._id,
          email: userData.email,
          wallet_id: userData.wallet_id,
          role: "user",
        };
        res.status(200).json({
          success: true,
          message: "User logged in successfully",
          payloadData: responseData,
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
      if (userData.is_blocked) {
        throw new CustomError("Account is blocked", 403);
      }
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
      if (userData.is_blocked) {
        throw new CustomError("Account is blocked", 403);
      }
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
    if (userData.is_deleted) {
      throw new CustomError("User does not exist");
    }
    if (userData.is_blocked) {
      throw new CustomError("Account is blocked", 401);
    }
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

const getUserProfileSpecific = async (req, res, next) => {
  try {
    const userId = req.params.id;
    // Validate user ID
    if (!userId) {
      return res
        .status(404)
        .json({ success: false, message: "User ID is required" });
    }
    // Authorization check
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
    const isOwner = userId === req.user.id;

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }

    // Fetch user data
    const userData = await services.findOne(
      User,
      { _id: userId },
      { password: false }
    );

    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the account is blocked (for non-admins)
    if (!isAdmin && userData.is_blocked) {
      return res
        .status(403)
        .json({ success: false, message: "Account is blocked" });
    }

    // Prepare response data
    let responseData = {
      _id: userData._id,
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      wallet_id: userData.wallet_id,
    };

    if (isAdmin) {
      responseData = { ...userData.toObject(), password: undefined }; // Remove password for admin view
    }
    // Send response
    res.status(200).json({ success: true, payloadData: responseData });
  } catch (err) {
    next(err);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    let payloadData = req.body;
    const allowedFields = ["name", "email", "phone", "password", "oldPassword"];
    await validateFields(payloadData, allowedFields, true);
    let userId = req.params.id;
    if (req.user.id !== userId) {
      throw new CustomError("Unauthorized access", 410);
    }
    if (payloadData.password) {
      await validateFields(
        payloadData,
        ["password", "oldPassword"],
        true,
        true
      );
      let userData = await services.findOne(User, { _id: userId });
      if (userData.is_blocked) {
        throw new CustomError("Account is blocked", 403);
      }

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
  getUserProfileSpecific,
  updateUserProfile,
};
