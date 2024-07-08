const express = require("express")
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser")
const sslChecker = require("ssl-checker")
const nvt = require("node-virustotal")
const request = nvt.makeAPI().setKey('f53dc40b7c524898860fb33d348a43fbf59e1e956dd61934d111aca2eaf5e82c');
// const https = require("https")
// const axios = require("axios")
const axios = require("axios").create({ maxRedirects: 10 }); 


//Middlewire
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const getSslDetails = async (hostname) => await sslChecker(hostname);

// const checkSiteLive = (url) => {
//     return new Promise((resolve, reject) => {
//       https.get(url, (res) => {
//         resolve(res.statusCode >= 200 && res.statusCode < 300);
//       }).on('error', (e) => {
//         resolve(false);
//       });
//     });
//   };

// const checkIfLive = async (hostname) => {
//     return new Promise((resolve) => {
//       https.get(`https://${hostname}`, (res) => {
//         resolve(true);
//       }).on('error', (e) => {
//         resolve(false);
//       });
//     });
//   };

// app.post('/getsslinfo', async (req,res) =>{
//     let domain = await req.body.name
//     let hasSSL = false;
//     let isLive = false;

//   try{
//     hasSSL = await getSslDetails(domain)
//     isLive = await checkIfLive(domain);

//     request.domainLookup(domain, async (err, response) => {
//           if (err) {
//               console.log('Well, crap.')
//               console.log(err)
//               return
//           }

//           let list = JSON.parse(response)

//           let analysisResults =  list.data.attributes.last_analysis_results

//           let hasMalware = false

//           for (let key in analysisResults) {
//               if (analysisResults[key].result.includes('malware')) {
//                   hasMalware = true
//                   break
//               }
//           }
//               res.json({"ssl":hasSSL.valid, "mal":hasMalware,"live": isLive })
//       })

//     // res.json({"ssl":hasSSL.valid, "mal":hasMal})
    

//   }catch(err){
//     console.log(err)
//   }
// })

// const checkIfLive = async (hostname) => {
//     try {
//       const response = await axios.get(`https://${hostname}`, {
//         maxRedirects: 5,
//         validateStatus: function (status) {
//           return status >= 200 && status < 400; // Accept only valid status codes
//         }
//       });
  
//       const finalUrl = response.request.res.responseUrl;
//       return { isLive: true, finalUrl };
//     } catch (e) {
//       console.error(`Error checking if live for ${hostname}:`);
//       return { isLive: false, finalUrl: null };
//     }
//   };
  
//   app.post('/getsslinfo', async (req, res) => {
//     const domain = req.body.name;
//     let hasSSL = false;
//     let isLive = false;
//     let finalUrl = null;
//     let hasMalware = false;
  
//     try {
//       hasSSL = await getSslDetails(domain);
//       const liveCheck = await checkIfLive(domain);
//       isLive = liveCheck.isLive;
//       finalUrl = liveCheck.finalUrl;
//     } catch (error) {
//       console.error(`Error processing ${domain}:`);
//       isLive = false;
//     }
  
//     try {
//       request.domainLookup(domain, async (err, response) => {
//         if (err) {
//           console.error(`Error looking up domain ${domain}:`);
//           return res.status(500).json({ "ssl": hasSSL.valid, "mal": hasMalware, "live": isLive, finalUrl });
//         }
  
//         try {
//           const list = JSON.parse(response);
//           const analysisResults = list.data.attributes.last_analysis_results;
  
//           for (let key in analysisResults) {
//             if (analysisResults[key].result.includes('malware')) {
//               hasMalware = true;
//               break;
//             }
//           }
  
//           res.json({ "ssl": hasSSL.valid, "mal": hasMalware, "live": isLive, finalUrl });
//         } catch (parseError) {
//           console.error(`Error parsing response for ${domain}:`);
//           res.status(500).json({ "ssl": hasSSL.valid, "mal": hasMalware, "live": isLive, finalUrl });
//         }
//       });
//     } catch (requestError) {
//       console.error(`Error making request for ${domain}:`);
//       res.status(500).json({ "ssl": hasSSL.valid, "mal": hasMalware, "live": isLive, finalUrl });
//     }
//   });

// const checkIfLive = async (hostname) => {
//     return new Promise((resolve) => {
//       const req = https.get(`https://${hostname}`, (res) => {
//         const { statusCode } = res;
//         const redirectLocation = res.headers.location;
//         if (statusCode >= 300 && statusCode < 400 && redirectLocation) {
//           resolve({ isLive: true, redirectTo: redirectLocation });
//         } else {
//           resolve({ isLive: statusCode >= 200 && statusCode < 300, redirectTo: null });
//         }
//       });
  
//       req.on('error', (err) => {
//         console.error(`Error fetching ${hostname}:`, err.message);
//         resolve({ isLive: false, redirectTo: null });
//       });
//     });
//   };
  
//   app.post('/getsslinfo', async (req, res) => {
//     let domain = req.body.name;
//     let hasSSL = false;
//     let isLive = false;
//     let redirectTo = null;
  
//     try {
//       hasSSL = await getSslDetails(domain);
//       const liveCheck = await checkIfLive(domain);
//       isLive = liveCheck.isLive;
//       redirectTo = liveCheck.redirectTo;
  
//       request.domainLookup(domain, async (err, response) => {
//         if (err) {
//           console.error(`Error looking up domain ${domain}:`, err.message);
//           res.json({ ssl: hasSSL.valid, mal: false, live: isLive, redirectTo });
//           return;
//         }
  
//         let list = JSON.parse(response);
//         let analysisResults = list.data.attributes.last_analysis_results;
//         let hasMalware = false;
  
//         for (let key in analysisResults) {
//           if (analysisResults[key].result.includes('malware')) {
//             hasMalware = true;
//             break;
//           }
//         }
  
//         res.json({ ssl: hasSSL.valid, mal: hasMalware, live: isLive, redirectTo });
//       });
//     } catch (err) {
//       console.error(`Error processing domain ${domain}:`, err.message);
//       res.json({ ssl: false, mal: false, live: false, redirectTo });
//     }
//   });
  
//   const PORT = process.env.PORT || 3001;
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
  
// const checkIfLive = async (hostname) => {
//     const followRedirects = require('follow-redirects');
//     const https = followRedirects.https;

//     // return new Promise((resolve) => {
//     //   const req = https.get(`https://${hostname}`, (res) => {
//     //     const { statusCode } = res;
//     //     const redirectLocation = res.headers.location;
//     //     if (statusCode >= 300 && statusCode < 400 && redirectLocation) {
//     //       resolve({ isLive: true, redirectTo: redirectLocation });
//     //     } else {
//     //       resolve({ isLive: statusCode >= 200 && statusCode < 300, redirectTo: null });
//     //     }
//     //   });
  
//     return new Promise((resolve) => {
//         const req = https.get(`https://${hostname}`, (res) => {
//           const { statusCode } = res;
//           const redirectLocation = res.responseUrl;
    
//           if (statusCode >= 300 && statusCode < 400 && redirectLocation) {
//             resolve({ isLive: true, redirectTo: redirectLocation });
//           } else {
//             resolve({ isLive: statusCode >= 200 && statusCode < 300, redirectTo: res.responseUrl });
//           }
//         });

//     //   req.on('error', (err) => {
//     //     console.error(`Error fetching ${hostname}:`, err.message);
//     //     resolve({ isLive: false, redirectTo: null });
//     //   });
//     // });


//     req.on('error', (err) => {
//         if (err.code === 'ENOTFOUND') {
//           console.error(`DNS lookup failed for ${hostname}:`, err.message);
//         } else if (err.code === 'ECONNREFUSED') {
//           console.error(`Connection refused for ${hostname}:`, err.message);
//         } else if (err.message.includes('Hostname/IP does not match certificate')) {
//           console.warn(`SSL certificate mismatch for ${hostname}:`, err.message);
//           resolve({ isLive: true, redirectTo: `https://${hostname}` });
//           return;
//         } else {
//           console.error(`Error fetching ${hostname}:`, err.message);
//         }
//         resolve({ isLive: false, redirectTo: null });
//       });
//     });
//   };

const extractAltNamesFromError = (errorMessage) => {
    const match = errorMessage.match(/DNS:([a-zA-Z0-9.-]+)/g);
    if (match) {
      return match.map(name => name.replace('DNS:', ''));
    }
    return [];
  };

const checkIfLive = async (hostname) => {
    try {
      const response = await axios.get(`https://${hostname}`, { maxRedirects: 10 });
      const redirectTo = response.request.res.responseUrl;
  
      return { isLive: true, redirectTo };
    } catch (err) {
      if (err.response) {
        const statusCode = err.response.status;
        const redirectTo = err.response.request.res.responseUrl;
  
        if (statusCode >= 300 && statusCode < 400 && redirectTo) {
          return { isLive: true, redirectTo };
        } else {
          return { isLive: statusCode >= 200 && statusCode < 300, redirectTo };
        }
      } else if (err.request) {
        console.error(`Error fetching ${hostname}:`, err.message);
        if (err.message.includes('Hostname/IP does not match certificate')) {
          console.warn(`SSL certificate mismatch for ${hostname}:`, err.message);
          const altNames = extractAltNamesFromError(err.message);
          const redirectTo = altNames.length > 0 ? `https://${altNames[0]}` : `https://${hostname}`;
          return { isLive: true, redirectTo };
        }
      } else {
        console.error(`Error fetching ${hostname}:`, err.message);
      }
      return { isLive: false, redirectTo: null };
    }
  };

//   app.post('/getsslinfo', async (req, res) => {
//     let domain = req.body.name;
//     let hasSSL = false;
//     let isLive = false;
//     let redirectTo = null;
//     let hasMalware = false
  
//     try {
//       console.log(`Processing domain: ${domain}`);
//       hasSSL = await getSslDetails(domain);
//       console.log(`SSL Details for ${domain}:`, hasSSL);
  
//       const liveCheck = await checkIfLive(domain);
//       isLive = liveCheck.isLive;
//       redirectTo = liveCheck.redirectTo;
//       console.log(`Live check for ${domain}: isLive=${isLive}, redirectTo=${redirectTo}`);
  
//       request.domainLookup(domain, async (err, response) => {
//         if (err) {
//           console.error(`Error looking up domain ${domain} in VirusTotal:`, err.message);
//           res.json({ ssl: hasSSL.valid, mal: false, live: isLive, redirectTo });
//           return;
//         }
  
//         let list = JSON.parse(response);
//         let analysisResults = list.data.attributes.last_analysis_results;
//         // let hasMalware = false;
  
//         for (let key in analysisResults) {
//           if (analysisResults[key].result.includes('malware')) {
//             hasMalware = true;
//             break;
//           }
//         }
//       });

//       res.json({ ssl: hasSSL.valid, mal: hasMalware, live: isLive, redirectTo });
//     } catch (err) {
//       console.error(`Error processing domain ${domain}:`, err.message);
//       res.json({ ssl: false, mal: false, live: false, redirectTo });
//     }
//   });

//   app.post("/getinfo/:domain",async (req,res)=>{
//         let domain = req.params.domain

//         res.json(await checkIfLive(domain))
//   })

app.post('/getsslinfo', async (req, res) => {
    let domain = req.body.name;
    let hasSSL = false;
    let isLive = false;
    let redirectTo = null;
    let hasMalware = false;
  
    try {
      console.log(`Processing domain: ${domain}`);
      hasSSL = await getSslDetails(domain);
      console.log(`SSL Details for ${domain}:`, hasSSL);
  
      const liveCheck = await checkIfLive(domain);
      isLive = liveCheck.isLive;
      redirectTo = liveCheck.redirectTo;
      console.log(`Live check for ${domain}: isLive=${isLive}, redirectTo=${redirectTo}`);
  
      request.domainLookup(domain, async (err, response) => {
        if (err) {
          console.error(`Error looking up domain ${domain} in VirusTotal:`, err.message);
          res.json({ ssl: hasSSL.valid, mal: false, live: isLive, redirectTo });
          return;
        }
  
        let list = JSON.parse(response);
        let analysisResults = list.data.attributes.last_analysis_results;
  
        for (let key in analysisResults) {
          if (analysisResults[key].result.includes('malware')) {
            hasMalware = true;
            break;
          }
        }
  
        res.json({ ssl: hasSSL.valid, mal: hasMalware, live: isLive, redirectTo });
      });
    } catch (err) {
      console.error(`Error processing domain ${domain}:`, err.message);
      res.json({ ssl: false, mal: false, live: false, redirectTo });
    }
  });
  


  app.post("/getinfo/:domain", async (req, res) => {
    let domain = req.params.domain;
    res.json(await checkIfLive(domain));
  });
  


  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  