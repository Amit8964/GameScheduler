const userRoutes = require("express").Router();
const userController = require("../controllers/userController");
const {
  validate_user_register,
  validate_user_update,
} = require("../validators/validator");
const {
  verifyPasswordReset,
  verifyUserToken,
} = require("../middlewares/authMiddleware");

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
userRoutes.get("/user/profile", verifyUserToken, userController.getUserProfile);
userRoutes.put(
  "/user/profile/update",
  validate_user_update,
  verifyUserToken,
  userController.updateUserProfile
);
//userRoutes.get("/user/transactions");
//userRoutes.get("/user/wallet/balance");

module.exports = userRoutes;
