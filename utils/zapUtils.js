const ZapClient = require('zaproxy');

require("dotenv").config() 
const zapOptions = {
    apiKey: process.env.ZAP_API_KEY,
    proxy: {
        host: process.env.ZAP_BASE_ADDRESS,
        port: 8080,
      },
};


const zap = new ZapClient(zapOptions);

const MALWARE_INDICATORS = [
    "Medium",
    "Low"
];

const scanWithZAP = async (domain) => {
    // try {

    //     // Start a new scan
    //     // const scanResponse = await zap.ascan.scan({ url:`https://${domain}`});
    //     const scanResponse = await zap.pscan.recordsToScan({ url:`https://${domain}`});

    //     const scanId = scanResponse.scan;

    //     console.log(`Started ZAP scan for ${domain} with scan ID: ${scanId}`);

    //     // Poll the status of the scan until it completes
    //     let status = '0';
    //     while (status !== '100') {
    //         await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    //         console.log("Loading")
    //         // const statusResponse = await zap.pscan.status(scanId);
    //         // status = statusResponse.status;
    //         // console.log(`Scan status for ${domain}: ${status}%`);
    //     }

    //     // Retrieve the results
    //     const results = await zap.core.alerts({ baseurl: domain });

    //     return results; 
    // } catch (error) {
    //     console.error('Error during ZAP scan:', error);
    //     throw error;
    // }


    try {
        // Start a spider scan
        const spiderResponse = await zap.spider.scan({ url: `https://${domain}` });
        const scanId = spiderResponse.scan;

        console.log(`Started ZAP spider scan for ${domain} with scan ID: ${scanId}`);

        // Poll the status of the spider scan until it completes
        let status = '0';
        while (status !== '100') {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            const statusResponse = await zap.spider.status(scanId);
            status = statusResponse.status;
            console.log(`Spider scan status for ${domain}: ${status}%`);
        }

        // Retrieve passive scan results (alerts)
        const alerts = await zap.core.alerts({ baseurl: `https://${domain}` });
        const alertResponse = [alerts]
        console.log(`Alerts found:`, alerts)



        const malwareAlerts = alertResponse.filter(alert => 
            alert.risk.includes(MALWARE_INDICATORS)
        );

        const malwareInfo = malwareAlerts.map(alert => ({
            name: alert.alert,
            risk: alert.risk,
            description: alert.description,
            solution: alert.solution,
            url: alert.url
        }));

        return {
            domain,
            malwareAlerts,
            malwareInfo,
        };

        // return alerts;

    } catch (error) {
        console.error('Error during passive scan:', error);
        throw error;
    }
};

module.exports={scanWithZAP}