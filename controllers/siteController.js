const sslChecker = require("ssl-checker")
const nvt = require("node-virustotal")
const axios = require("axios").create({maxRedirects:10})
const User = require("../models/User")
const sendEmail = require("../utils/sendEmail")
const {checkIfLive} = require("../utils/siteCheck")


const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

require("dotenv").config() 
const request = nvt.makeAPI().setKey(process.env.VIRUSTOTAL_API_KEY) 

const getSslDetails = async (hostname) => await sslChecker(hostname);

const runSingleCheck = async (req,res) =>{
    const userId = req.body._id
    const domain = req.body.name
    const userName = req.body.username

    // const error = []
    const error = {}
    
    console.log(`Single scan initated by ${userName}`)

    console.time(`Scan time for ${domain}`)
    try{
    console.log(`Processing domain: ${domain}`);
    let hasSSL = false;
    let isLive = false;
    let redirectTo;
    let hasMalware = false;

    hasSSL = await getSslDetails(domain)
    const liveCheck = await checkIfLive(domain)
    isLive = liveCheck.isLive
    redirectTo = liveCheck.redirectTo

    request.domainLookup(domain, async (err, response) => {
        if (err) {
          console.error(`Error looking up domain ${domain} in VirusTotal:`);
          error[domain] = {status: `Error: ${err}`}
          // error.push({ name: domain, status: `Error: ${err}` });
          // res.status(500).send(`Error looking up domain ${domain} in VirusTotal:`,err.message);
        //   res.json({ ssl: hasSSL.valid, mal: false, live: isLive, redirectTo });
          return;
        }
  
        const list = JSON.parse(response);
        const analysisResults = list.data.attributes.last_analysis_results;
  
        for (let key in analysisResults) {
          if (analysisResults[key].result.includes('malware')) {
            hasMalware = true;
            break;
          }
        }
  
        const siteData = {
          name: domain,
          hasSSL: hasSSL.valid,
          hasMalware,
          isLive,
          redirectTo
        };
  
        // Save the site data to the user's site list
           const user = await User.findOne({ _id: userId, "sites.name": domain });

          if (user) {
            console.log(`Updating ${domain} in database`)
            // Update the existing site
            await User.updateOne(
              { _id: userId, "sites.name": domain },
              {
                $set: {
                  "sites.$.hasSSL": hasSSL.valid,
                  "sites.$.hasMalware": hasMalware,
                  "sites.$.isLive": isLive,
                  "sites.$.redirectTo": redirectTo,
                }
              }
            );
            
          } else {
            console.log(`Adding ${domain} to database`)
            // Add the new site
            await User.updateOne(
              { _id: userId },
              { $push: { sites: siteData }  }
            );
            
          }
         console.timeEnd(`Scan time for ${domain}`)
          console.log(`Done, now printing results to terminal`)
          const databaseResponse = await User.findById(userId) 
          const resultsResponse = databaseResponse.sites
          delete resultsResponse.password
          console.log(siteData)
          res.json({resultsResponse, error});
  
        // res.json(siteData);
      });
    }catch(err){
      console.timeEnd(`Scan time for ${domain}`)
        console.error(`Error processing domain ${domain}`)
        error[domain] = {status: `Error: ${err.message}`, errorDetails:err}
        // error.push({ name: domain, status: `Error: ${err.message}` });
        res.json({ resultsResponse:null, error });
        // res.status(500).send(`Error processing domain ${domain}`,err.message);
        // res.json({ ssl: false, mal: false, live: false, redirectTo });
    }
}

// const runAllChecks = async (req, res) => {
//   const userId = req.body._id;
//   const sites = req.body.sites;

//   const results = [];
//   const errors = [];

//   console.time(`Start time`)
//   for (const site of sites) {
//     const domain = site.name;
//     let hasSSL = false;
//     let isLive = false;
//     let redirectTo = null;
//     let hasMalware = false;

//     try {
//       console.log(`Processing domain: ${domain}`);
  

//       hasSSL = await getSslDetails(domain);
//       const liveCheck = await checkIfLive(domain);
//       isLive = liveCheck.isLive;
//       redirectTo = liveCheck.redirectTo;

//       request.domainLookup(domain, async (err, response) => {
//         if (err) {
//           console.error(`Error looking up domain ${domain} in VirusTotal:`, err);
//           errors.push({ name: domain, status: `Error: ${err}` });
//         } else {
//           const list = JSON.parse(response);
//           const analysisResults = list.data.attributes.last_analysis_results;

//           for (let key in analysisResults) {
//             if (analysisResults[key].result.includes('malware')) {
//               hasMalware = true;
//               break;
//             }
//           }

//           const siteData = { name: domain, ssl: hasSSL.valid, mal: hasMalware, live: isLive, redirectTo };

//           results.push(siteData);

//           const user = await User.findOne({ _id: userId, "sites.name": domain });

//           if (user) {
//             console.log(`Updating ${domain} in database`);

//             await User.updateOne(
//               { _id: userId, "sites.name": domain },
//               {
//                 $set: {
//                   "sites.$.hasSSL": hasSSL.valid,
//                   "sites.$.hasMalware": hasMalware,
//                   "sites.$.isLive": isLive,
//                   "sites.$.redirectTo": redirectTo,
//                 }
//               }
//             );
          
//           } else {
//             console.log(`Adding ${domain} to database`);

//             await User.updateOne(
//               { _id: userId },
//               { $push: { sites: { name: domain, "hasSSL": hasSSL.valid, hasMalware, isLive, redirectTo } } }
//             );
           
//           }
//         }

//         if (results.length + errors.length === sites.length) {
//           console.log(`Done, now printing results to terminal`);
//           const response = await User.findById(userId);
//           const resultsResponse = response.sites;
//           delete resultsResponse.password;
//           console.log(results);
//           res.json({ success: resultsResponse, errors });
//         }
//       });
//     } catch (err) {
//       console.error(`Error processing domain ${domain}`, err.message);
//       errors.push({ name: domain, status: `Error: ${err.message}` });

//       if (results.length + errors.length === sites.length) {
//         console.log(`Done, now printing results to terminal`);
//         const response = await User.findById(userId);
//         const resultsResponse = response.sites;
//         delete resultsResponse.password;
//         console.log(results);
//         res.json({ success: resultsResponse, errors });
//       }
//     }
//   }
//   console.timeEnd(`Start time`)
// };

const runAllChecks = async (req, res) => {
  const userId = req.body._id;
  const sites = req.body.sites;
  const userName = req.body.username
  const userEmail = req.body.email; 
  
  const results = [];
  const errors = [];

  console.log(`Full scan started by ${userName}`)
  console.time(`Start time`);
  
  // Use Promise.all to run all checks concurrently
  await Promise.all(sites.map(async (site) => {
    const domain = site.name;
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

      // Use promise-based request to VirusTotal
      const response = await new Promise((resolve, reject) => {
        request.domainLookup(domain, (err, response) => {
          if (err) reject(err);
          else resolve(response);
        });
      });

      const list = JSON.parse(response);
      const analysisResults = list.data.attributes.last_analysis_results;

      for (let key in analysisResults) {
        if (analysisResults[key].result.includes('malware')) {
          hasMalware = true;
          break;
        }
      }

      const siteData = { name: domain, ssl: hasSSL.valid, mal: hasMalware, live: isLive, redirectTo };

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
            }
          }
        );
      } else {
        console.log(`Adding ${domain} to database`);
        await User.updateOne(
          { _id: userId },
          { $push: { sites: { name: domain, hasSSL: hasSSL.valid, hasMalware, isLive, redirectTo } } }
          // { $push: { sites: siteData }  }
        );
      }
    } catch (err) {
      console.error(`Error processing domain ${domain}`, err.message);
      errors.push({ name: domain, status: `Error: ${err.message}` });
    }
  }));

  console.log(`Done, now printing results to terminal`);
  const response = await User.findById(userId);
  const resultsResponse = response.sites;
  delete resultsResponse.password;
  console.log(results);

  res.json({ success: resultsResponse, errors });
  console.timeEnd(`Start time`);

 // Generate PDF report
 console.log("Generating Report")

 const pdfPath = path.join(__dirname, 'report.pdf');
 const doc = new PDFDocument();
 const buffers = [];

 doc.on('data', buffers.push.bind(buffers));
 doc.on('end', async () => {
     const pdfBuffer = Buffer.concat(buffers);

     // Send the PDF via email
     const subject = 'Your Website Scan Report';
     const text = 'Please find attached your website scan report.';

     await sendEmail(userEmail, subject, text, pdfBuffer);
 });

 doc.fontSize(18).text('Website Scan Report', { align: 'center' });
 doc.moveDown();
 doc.fontSize(14).text(`User: ${userName}`, { align: 'left' });
 doc.moveDown();
 doc.fontSize(12).text('Malware Detected Sites:', { underline: true });
 results.filter(site => site.mal).forEach(site => {
     doc.text(`- ${site.name}`);
 });

 doc.moveDown();
 doc.fontSize(12).text('Errors:', { underline: true });
 errors.forEach(error => {
     doc.text(`- ${error.name}: ${error.status}`);
 });

 doc.moveDown();
 doc.fontSize(12).text('Successful Scans:', { underline: true });
 results.filter(site => !site.mal).forEach(site => {
     doc.text(`- ${site.name}`);
 });

 doc.end();
};




//Delete site(s) from the database
const deleteSite = async (req,res) =>{
  const userId = req.body._id
  const sites = req.body.sites
  const userName = req.body.username

  console.log(`Deletion request kicked of by ${userName}`)

  let  completed = 0
  for(const site of sites){
    try{
      await User.updateOne(
        {_id: userId},
        {$pull: { sites: { name: site } }},
      )
      
      console.log(`Succesfully deleted ${site} from the database`)

      completed+=1

      if(completed === sites.length){
        const databaseResponse = await User.findById(userId) 
        const resultsResponse = databaseResponse.sites
        delete resultsResponse.password
    
        res.json({message:completed===1?`Succesfully deleted ${site}`:`Succesfully deleted all ${completed} sites`, resultsResponse})
      }
  
    }catch(err){
      console.error(`Error deleting domain ${site}:`, err.message);
      res.json({ error: `Error deleting domain ${site}: ${err.message}` });
    }
  }
}

  module.exports ={
    runAllChecks,
    runSingleCheck,
    deleteSite
  }