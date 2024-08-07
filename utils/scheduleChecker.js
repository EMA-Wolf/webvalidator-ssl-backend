const { checkIfLive } = require('./siteCheck');
const User = require('../models/User');
const sslChecker = require('ssl-checker');
const nvt = require("node-virustotal");
const path = require('path');
const fs = require('fs');
const { generatePDFReport3 } = require('./pdfReportGenerator');
const sendEmail = require('./sendEmail');
require("dotenv").config();

const getSslDetails = async (hostname) => await sslChecker(hostname);
const request = nvt.makeAPI().setKey(process.env.VIRUSTOTAL_API_KEY);

const runCheckSite = async (userId, sites) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const userName = user.username;
  const userEmail = user.email;

  const results = [];
  const errors = [];

  console.log(`Scheduled scan started by ${userName}`);
  console.time(`Start time`);

  await Promise.all(
    sites.map(async (site) => {
      const domain = site;
      let hasSSL = false;
      let isLive = false;
      let redirectTo = null;
      let hasMalware = false;

      try {
        console.log(`Processing domain: ${domain}`);

        hasSSL = await getSslDetails(domain);
        const liveCheck = await checkIfLive(domain);
        isLive = liveCheck.isLive;
        redirectTo = liveCheck.redirectTo;

        const response = await new Promise((resolve, reject) => {
          request.domainLookup(domain, (err, response) => {
            if (err) reject(err);
            else resolve(response);
          });
        });

        const list = JSON.parse(response);
        const analysisResults = list.data.attributes.last_analysis_results;

        for (let key in analysisResults) {
          if (analysisResults[key].result.includes("malware")) {
            hasMalware = true;
            break;
          }
        }

        const siteData = {
          name: domain,
          ssl: hasSSL.valid,
          mal: hasMalware,
          live: isLive,
          redirectTo,
        };

        results.push(siteData);

        const user = await User.findOne({ _id: userId, "sites.name": domain });

        if (user) {
          console.log(`Updating ${domain} in database`);

          await User.updateOne(
            { _id: userId, "sites.name": domain },
            {
              $set: {
                "sites.$.hasSSL": hasSSL.valid,
                "sites.$.hasMalware": hasMalware,
                "sites.$.isLive": isLive,
                "sites.$.redirectTo": redirectTo,
              },
            }
          );
        } else {
          console.log(`Adding ${domain} to database`);
          await User.updateOne(
            { _id: userId },
            {
              $push: {
                sites: {
                  name: domain,
                  hasSSL: hasSSL.valid,
                  hasMalware,
                  isLive,
                  redirectTo,
                },
              },
            }
          );
        }
      } catch (err) {
        console.error(`Error processing domain ${domain}`, err.message);
        errors.push({ name: domain, status: `Error: ${err.message}` });
      }
    })
  );

  console.log(`Done, now printing results to terminal`);
  console.log(results);

  const sslResults = results.filter(r => !r.ssl);
  const malResults = results.filter(r => r.mal);
  const successfulResults = results.filter(r => r.ssl && !r.mal);

  const processedResults = {
    sslResults: {
      data: sslResults,
      shouldDisplay: sslResults.length > 0,
      needsPageBreak: sslResults.length > 4,
    },
    malResults: {
      data: malResults,
      shouldDisplay: malResults.length > 0,
      needsPageBreak: malResults.length > 4,
    },
    errors: {
      data: errors,
      shouldDisplay: errors.length > 0,
      needsPageBreak: errors.length > 4,
    },
    successfulResults: {
      data: successfulResults,
      shouldDisplay: successfulResults.length > 0,
    }
  };
  console.log("Generating Report");

  const templatePath = path.join(__dirname, "../utils/assets", "template.html");
  const pdfPath = path.join(__dirname, "../utils/assets", "report.pdf");

  try {
    await generatePDFReport3(userName, processedResults, templatePath, pdfPath);
    const pdfBuffer = fs.readFileSync(pdfPath);

    const subject = "Your Scheduled Website Scan Report";
    const text = "Please find attached your scheduled website scan report.";

    await sendEmail(userEmail, subject, text, pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF report:", error);
  }
};

module.exports = {
  runCheckSite,
};
