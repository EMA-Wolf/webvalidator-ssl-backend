const zaproxy = require('zaproxy');

require("dotenv").config() 
const zapOptions = {
    apiKey: process.env.ZAP_API_KEY, // if needed
    proxy: {
        host: process.env.ZAP_BASE_ADDRESS,
        port: 8080,
      },
};

const zap = new zaproxy(zapOptions);
 
const scanWithZAP = async (domain) => {
    try {
        // Start a new scan
        const scanResponse = await zap.ascan.scan({ url: domain, recurse: true });
        const scanId = scanResponse.scan;

        console.log(`Started ZAP scan for ${domain} with scan ID: ${scanId}`);

        // Poll the status of the scan until it completes
        let status = '0';
        while (status !== '100') {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            const statusResponse = await zap.ascan.status(scanId);
            status = statusResponse.status;
            console.log(`Scan status for ${domain}: ${status}%`);
        }

        // Retrieve the results
        const results = await zap.core.alerts({ baseurl: domain });

        return results; 
    } catch (error) {
        console.error('Error during ZAP scan:', error.message);
        throw error;
    }
};

module.exports={scanWithZAP}