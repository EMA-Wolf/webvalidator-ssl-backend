const express = require("express")
const router = express.Router()
const {certificate, verifyDomain} = require("../controllers/sslController")

router.post("/generate-cert",certificate)
router.post("/verify-domain", verifyDomain);

module.exports = router