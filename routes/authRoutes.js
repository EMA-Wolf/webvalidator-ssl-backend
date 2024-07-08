const express = require("express")
const {check} = require("express-validator")
const {Signup, Login} = require("../controllers/authController")

const router = express.Router()

router.post(
    "/signup",
    [
        check("email", "Please include a vaild email").isEmail(),
        check("password", "Password is required and should be 4 or more characters").isLength({min:4}),
    ],
    Signup
)

router.post(
    "/Login",
    [
        check("email", "Please include a vaild email").isEmail(),
        check("password", "Password is required").exists(),
    ],
    Login
)

module.exports = router