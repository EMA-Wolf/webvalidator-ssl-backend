const express = require("express")
const router = express.Router()
const {runAllChecks, runSingleCheck, deleteSite, getProgress} = require("../controllers/siteController")

router.post("/getsiteinfo",runSingleCheck)
router.post("/getallsitesinfo",runAllChecks)
router.post("/deleteSites",deleteSite)
router.get("/progress/:userName", getProgress);

module.exports = router