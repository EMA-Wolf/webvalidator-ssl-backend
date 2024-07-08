const express = require("express")
const router = express.Router()
const {certificate} = require("../controllers/sslController")

router.post("/generate-cert",certificate)

module.exports = router