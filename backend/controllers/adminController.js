const Admin = require("../models/admin");
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

const createAdmin = async (req, res, next) => {
  try {
    // if (!req.user.role == "superadmin") {
    //   throw new CustomError("Unauthorized access", 401); have to do somthing about it
    // }

    let payloadData = req.body;
    if (req.user.role !== "superadmin") {
      throw new CustomError("Unathorized access", 410);
    }
    let userData = await Admin.findOne({ email: payloadData.email });
    if (userData) {
      res.status(409).json({
        success: false,
        message: "User allready exist ",
      });
    } else {
      let allowedFields = ["name", "phone", "email", "password"]; // keep remember
      await validateFields(payloadData, allowedFields, true, true);
      const hashPassword = await generateHashPassword(payloadData.password);
      payloadData.password = hashPassword;
      //can not send is_verified field
      let result = await services.saveData(Admin, payloadData);
      if (result) {
        res
          .status(200)
          .json({ success: true, message: "Admin created successfully" });
      }
    }
  } catch (err) {
    next(err);
  }
};

const loginAdmin = async (req, res, next) => {
  try {
    const payloadData = req.body;
    const allowedFields = ["email", "password"];
    await validateFields(payloadData, allowedFields, true, true);
    let userData = await services.findOne(Admin, { email: payloadData.email });
    if (userData) {
      const compareResult = await compareHashPassword(
        payloadData.password, //created an error
        userData.password
      );
      if (compareResult) {
        const token = await generateToken({
          id: userData._id,
          email: userData.email,
          role: userData.role,
        });
        res.status(200).json({
          success: true,
          message: "Admin logged in successfully",
          token,
        });
      } else {
        throw new CustomError("Password did't match", 401);
      }
    } else {
      throw new CustomError("Admin does not exist", 404);
    }
  } catch (err) {
    next(err);
  }
};

const getAdminProfile = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const adminEmail = req.user.email;

    const userData = await services.findOne(
      Admin,
      { _id: adminId },
      { _id: true, name: true, phone: true, email: true }
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

const blockUser = async (req, res, next) => {
  try {
    let userId = req.params.id;
    let userData = await services.findByIdAndUpdate(
      User,
      userId,
      { is_blocked: true },
      {
        new: true,
        fields: { name: true, email: true, phone: true },
      }
    );
    if (userData) {
      res
        .status(200)
        .json({ success: true, message: "User Blocked successfully" });
    } else {
      throw new CustomError("Somthing went wrong", 404);
    }
  } catch (err) {
    next(err);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    let userId = req.params.id;
    let userData = await services.findByIdAndUpdate(
      User,
      userId,
      { is_blocked: false },
      {
        new: true,
        fields: { name: true, email: true, phone: true },
      }
    );
    if (userData) {
      res
        .status(200)
        .json({ success: true, message: "User Unblocked successfully" });
    } else {
      throw new CustomError("Somthing went wrong", 404);
    }
  } catch (err) {
    next(err);
  }
};

const getAlluser = async (req, res, next) => {
  try {
    let result = await services.getData(User, {}, { password: false });
    res.status(200).json({ success: true, payloadData: result });
  } catch (err) {
    next(err);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    let payloadData = req.body;
    let userId = req.params.id;
    if (!userId) {
      throw new CustomError("User id is required", 404);
    }
    if (payloadData.password) {
      payloadData.password = await generateHashPassword(payloadData.password);
    }
    let userData = await services.findByIdAndUpdate(User, userId, payloadData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile Updated successfully",
      payloadData: userData,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAdmin,
  loginAdmin,
  getAdminProfile,
  blockUser,
  unblockUser,
  updateUserProfile,
  getAlluser,
};
