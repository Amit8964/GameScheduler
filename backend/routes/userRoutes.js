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
  "/user/register/profile",
  validate_user_register,
  userController.registerUser
);
userRoutes.post("/user/register/profile/verify", userController.verifyUser);
userRoutes.post("/user/login/profile", userController.loginUser);
userRoutes.post("/user/profile/forgot/password", userController.forgotPassword);
userRoutes.post(
  "/user/profile/forgot/password/verify",
  userController.otpMatchForReset
);
userRoutes.post(
  "/user/profile/reset/password/:token",
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
  "/admin/user-management/user/block/:id",
  verifyAdminToken,
  adminController.blockUser
);
userRoutes.get(
  "/admin/user-management/user/unblock/:id",

  adminController.unblockUser
);
userRoutes.get(
  "/admin/user-management/user/profile",
  verifyAdminToken,
  adminController.getAlluser
);
userRoutes.get(
  "/admin/user-management/user/profile/:id",
  verifyAdminToken,
  userController.getUserProfileSpecific
);
userRoutes.put(
  "/admin/user-management/user/profile/update/:id",
  verifyAdminToken,
  adminController.updateUserProfile
);
userRoutes.post(
  "/admin/create/profile",
  verifyAdminToken,
  adminController.createAdmin
);
userRoutes.post(
  "/admin/login/profile",

  adminController.loginAdmin
);

module.exports = userRoutes;
