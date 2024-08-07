const express = require("express");
const { check } = require("express-validator");
const {
  Signup,
  Login,
  updateUser,
  deleteUser,
  requestPasswordReset,
  renderResetPasswordForm,
  resetPassword, 
} = require("../controllers/authController");

const router = express.Router();

router.post(
  "/signup",
  [
    check("email", "Please include a vaild email").isEmail(),
    check(
      "password",
      "Password is required and should be 4 or more characters"
    ).isLength({ min: 4 }),
  ],
  Signup
);

router.post(
  "/Login",
  [
    check("email", "Please include a vaild email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  Login
);

router.post(
  "/updateUser",
  [
    check("email", "Please include a valid email").isEmail(),
  ],
  updateUser
);

router.post("/deleteUser", deleteUser);
router.post("/request-password-reset", requestPasswordReset);
router.get("/reset-password/:token", renderResetPasswordForm);
router.post("/reset-password", resetPassword);
module.exports = router;
