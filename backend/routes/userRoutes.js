const userRoutes = require("express").Router();
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const {
  validate_user_register,
  validate_user_update,
} = require("../validators/validator");
const {
  verifyPasswordReset,
  verifyUserToken,
  verifyAdminToken,
} = require("../middlewares/authMiddleware");

//User Routes
userRoutes.post(
  "/user/register",
  validate_user_register,
  userController.registerUser
);
userRoutes.post("/user/register/verify", userController.verifyUser);
userRoutes.post("/user/login", userController.loginUser);
userRoutes.post("/user/forgot/password", userController.forgotPassword);
userRoutes.post("/user/reset/password/verify", userController.otpMatchForReset);
userRoutes.post(
  "/user/reset/password/:token",
  verifyPasswordReset,
  userController.resetPassword
);
userRoutes.get(
  "/user/profile/:id",
  verifyUserToken,
  userController.getUserProfileSpecific
);
userRoutes.put(
  "/user/profile/update/:id",
  validate_user_update,
  verifyUserToken,
  userController.updateUserProfile
);

//userRoutes.get("/user/transactions");
//userRoutes.get("/user/wallet/balance");

//Admin routes
userRoutes.get(
  "/admin/dashboard/user/block/:id",
  verifyAdminToken,
  adminController.blockUser
);
userRoutes.get(
  "/admin/dashboard/user/unblock/:id",

  adminController.unblockUser
);
userRoutes.get(
  "/admin/dashboard/user/profile",
  verifyAdminToken,
  adminController.getAlluser
);
userRoutes.get(
  "/admin/dashboard/user/profile/:id",
  verifyAdminToken,
  userController.getUserProfileSpecific
);
userRoutes.put(
  "/admin/dashboard/user/profile/update/:id",
  verifyAdminToken,
  adminController.updateUserProfile
);

module.exports = userRoutes;
