const { Builder, By, until, Capabilities  } = require('selenium-webdriver');
const ZapClient = require('zaproxy');
const User = require("../models/User");
const path = require('path');

require("dotenv").config();

const zapOptions = {
    apiKey: process.env.ZAP_API_KEY,
    proxy: {
        host: process.env.ZAP_BASE_ADDRESS,
        port: 8080,
    },
};

const zap = new ZapClient(zapOptions);

// const launchBrowser = async (url) => {
//     let driver;
//     try {
//         // Try to launch Chrome
//         driver = await new Builder().forBrowser('chrome').build();
//     } catch (e) {
//         console.log('Chrome not found, falling back to Firefox');
//         // Fall back to Firefox
//         driver = await new Builder().forBrowser('firefox').build();
//     }

//     try {
//         await driver.get(url);
//         // Perform any additional actions needed
//         await driver.wait(until.titleIs('expected title'), 10000);
//     } finally {
//         await driver.quit();
//     }
// };

const updateProgress = async (userName, progress) => {
    const user = await User.findOne({username:userName});
    if (!user) {
      await User.updateOne(
        {username: userName },
        { $set: { "vScanProgress": progress } }
      );
    } else {
      await User.updateOne(
        {username: userName },
        { $set: { "vScanProgress": progress } }
      );
    }
  };

const launchBrowserWithProxy = async (url) => {
    let driver;
    try {
        // Proxy settings for ZAP
        const capabilities = Capabilities.chrome();
        capabilities.set('proxy', {
            proxyType: 'manual',
            httpProxy: `${process.env.ZAP_BASE_ADDRESS}:${process.env.ZAP_PORT}`,
            sslProxy: `${process.env.ZAP_BASE_ADDRESS}:${process.env.ZAP_PORT}`
        });

        // Try to launch Chrome with ZAP proxy
        driver = await new Builder()
            .forBrowser('chrome')
            .withCapabilities(capabilities)
            .setChromeOptions(new (require('selenium-webdriver/chrome').Options)()
                .setChromeBinaryPath(path.resolve(__dirname, 'chromedriver.zip')))
            .build();
    } catch (e) {
        console.log('Chrome not found, falling back to Firefox');

        // Proxy settings for ZAP
        const firefoxCapabilities = Capabilities.firefox();
        firefoxCapabilities.set('proxy', {
            proxyType: 'manual',
            httpProxy: `${process.env.ZAP_BASE_ADDRESS}:${process.env.ZAP_PORT}`,
            sslProxy: `${process.env.ZAP_BASE_ADDRESS}:${process.env.ZAP_PORT}`
        });

        // Fall back to Firefox with ZAP proxy
        driver = await new Builder()
            .forBrowser('firefox')
            .withCapabilities(firefoxCapabilities)
            .setFirefoxOptions(new (require('selenium-webdriver/firefox').Options)()
                .setFirefoxBinaryPath(path.resolve(__dirname, 'geckodriver')))
            .build();
    }

    try {
        await driver.get(url);
        // Wait for the page to load
        await driver.wait(until.elementLocated(By.tagName('body')), 30000); // 30 seconds

    } catch (e) {
        console.error('Error during page load:', e);
    } 

    return driver;
};


const scanWithZAP = async (userName,domain) => {
    let driver;
    try {

        driver = await launchBrowserWithProxy(`https://${domain}`);
        // // Start a spider scan
        const spiderResponse = await zap.spider.scan({ url: `https://${domain}` });
        const scanId = spiderResponse.scan;

        console.log(`Started ZAP spider scan for ${domain} with scan ID: ${scanId}`);

        // Poll the status of the spider scan until it completes
        let status = '0';
        while (status !== '100') {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            const statusResponse = await zap.spider.status(scanId);
            status = statusResponse.status;
            await updateProgress(userName,status)
            console.log(`Spider scan status for ${domain}: ${status}%`);
        }

         // Start an AJAX Spider scan
        //  const ajaxSpiderResponse = await zap.ajaxSpider.scan({ url: `https://${domain}` });
        //  const scanId = ajaxSpiderResponse.scan;
 
        //  console.log(`Started AJAX Spider scan for ${domain} with scan ID: ${scanId}`);
 
        //  // Poll the status of the AJAX Spider scan until it completes
        //  let status = 'running';
        //  while (status === 'running') {
        //      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        //      const statusResponse = await zap.ajaxSpider.status();
        //      status = statusResponse.status;
        //      console.log(`AJAX Spider scan status for ${domain}: ${status}`);
        //  }

        // Retrieve passive scan results (alerts)
        const alertResponse = await zap.core.alerts({ baseurl: `https://${domain}` });
        
   

        const alerts = alertResponse.alerts
        const filteredalerts = alerts.filter(alert => alert.risk === `Low` || alert.risk === `High`);

        const uniqueAlerts = [];
        const seenAlerts = new Set();

        for (const alert of filteredalerts) {
            const alertSignature = `${alert.name}-${alert.description}`;
            if (!seenAlerts.has(alertSignature)) {
                seenAlerts.add(alertSignature);
                uniqueAlerts.push({
                    name: alert.name,
                    description: alert.description,
                    solution:alert.solution
                });
            }
        }

        return {
            uniqueAlerts
        };

    } catch (error) {
        console.error('Error during passive scan:', error);
        throw error;
    }finally {
        if (driver) {
            await driver.quit(); // Ensure the browser closes after the scan
        }
    }
};

module.exports = { scanWithZAP };
