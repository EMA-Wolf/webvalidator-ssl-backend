const express = require("express")
const { scanDomain } = require("../controllers/scanController")

const router = express.Router()

router.post("/domain",scanDomain)

module.exports = router