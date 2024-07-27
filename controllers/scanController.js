const {scanWithZAP} = require("../utils/zapUtils")
const {getWhoisInfo} = require("../utils/whoisUtils");
const User = require("../models/User");

const scanDomain = async (req,res) =>{
    const { domain } = req.body

    if(!domain){
        return res.status(400).json({ error: 'Domain is required' });
    }

    console.time(`Scan time`)
    try {
        const results = await getWhoisInfo(domain)
        console.timeEnd(`Scan time`);
        console.log(`Whois/Domain Lookup for domain: ${domain} completed successfully`);
        res.json({details:results});
    } catch (error) {
        console.timeEnd(`Scan time`);
        console.error(`Error scanning Whois/Domain Lookup domain: ${domain}`, error.message);
        res.status(500).json({ error: 'Failed to scan domain' });
    }
}

const vunlerabilityScanDomain = async (req,res) => {
    const {domain, username} = req.body

    if(!domain) {
        return res.status(400).json({ error: 'Domain is required' });
    }

    console.log(`Vunlerability scan started by ${username}`)

    console.time(`Scan time`)
    try {
        const scanResults = await scanWithZAP(username,domain);
        console.timeEnd(`Scan time`);
        console.log(`Passive Vunlerability scan completed for domain: ${domain}`);
        res.json({scanResults});
    } catch (error) {
        console.timeEnd(`Scan time`);
        console.error(`Error Passive Vunlerability scanning domain: ${domain}`, error.message);
        res.status(500).json({ error: 'Failed to scan domain' });
    }
}

const getvunlerabilityScanProgress = async (req,res) =>{
        const userName = req.params.userName
        const user = await User.findOne({username:userName});
        res.json({ progress: user.vScanProgress });
}

module.exports = {scanDomain ,vunlerabilityScanDomain , getvunlerabilityScanProgress}