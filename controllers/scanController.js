const {scanWithZAP} = require("../utils/zapUtils")

const scanDomain = async (req,res) =>{
    const { domain } = req.body

    if(!domain){
        return res.status(400).json({ error: 'Domain is required' });
    }

    console.time(`Scan time`)
    try {
        const scanResults = await scanWithZAP(domain);
        console.timeEnd(`Scan time`);
        console.log(`Completed scan for domain: ${domain}`);

        res.json({ report: scanResults});
    } catch (error) {
        console.timeEnd(`Scan time`);
        console.error(`Error scanning domain: ${domain}`, error.message);
        res.status(500).json({ error: 'Failed to scan domain' });
    }
}

module.exports = {scanDomain}