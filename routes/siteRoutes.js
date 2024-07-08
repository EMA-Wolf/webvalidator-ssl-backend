const express = require("express")
const router = express.Router()
const {runAllChecks, runSingleCheck, deleteSite} = require("../controllers/siteController")

router.post("/getsiteinfo",runSingleCheck)
router.post("/getallsitesinfo",runAllChecks)
router.post("/deleteSites",deleteSite)

module.exports = router