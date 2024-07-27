const express = require("express")
const { scanDomain, vunlerabilityScanDomain, getvunlerabilityScanProgress } = require("../controllers/scanController")

const router = express.Router()

router.post("/domain",scanDomain)
router.post("/vunlerabilityScan",vunlerabilityScanDomain)
router.get("/vunlerabilityScanProgress/:userName", getvunlerabilityScanProgress)

module.exports = router