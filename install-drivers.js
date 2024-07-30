// const { exec } = require('child_process');
// const fs = require('fs');
// const path = require('path');
// const https = require('https');

// const downloadFile = (url, outputPath) => {
//     return new Promise((resolve, reject) => {
//         const file = fs.createWriteStream(outputPath);
//         https.get(url, (response) => {
//             response.pipe(file);
//             file.on('finish', () => {
//                 file.close(resolve);
//             });
//         }).on('error', (err) => {
//             fs.unlink(outputPath, () => {});
//             reject(err);
//         });
//     });
// };

// const installDrivers = async () => {
//     try {
//         const platform = process.platform;
//         const arch = process.arch;

//         let geckoDriverUrl;
//         let chromeDriverUrl;

//         if (platform === 'linux' && arch === 'x64') {
//             geckoDriverUrl = 'https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-linux64.tar.gz';
//             chromeDriverUrl = 'https://chromedriver.storage.googleapis.com/91.0.4472.19/chromedriver_linux64.zip';
//         } else if (platform === 'darwin' && arch === 'x64') {
//             geckoDriverUrl = 'https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-macos.tar.gz';
//             chromeDriverUrl = 'https://chromedriver.storage.googleapis.com/91.0.4472.19/chromedriver_mac64.zip';
//         } else {
//             throw new Error('Unsupported platform or architecture');
//         }

//         const geckoDriverPath = path.join(__dirname, 'geckodriver.tar.gz');
//         const chromeDriverPath = path.join(__dirname, 'chromedriver.zip');

//         await downloadFile(geckoDriverUrl, geckoDriverPath);
//         await downloadFile(chromeDriverUrl, chromeDriverPath);

//         exec(`tar -xzf ${geckoDriverPath} -C ${__dirname}`, (err) => {
//             if (err) throw err;
//             console.log('GeckoDriver installed');
//         });

//         exec(`unzip -o ${chromeDriverPath} -d ${__dirname}`, (err) => {
//             if (err) throw err;
//             console.log('ChromeDriver installed');
//         });
//     } catch (err) {
//         console.error('Error installing drivers:', err);
//     }
// };

// installDrivers();


// const { exec } = require('child_process');
// const fs = require('fs');
// const https = require('https');
// const path = require('path');

// // URL to download ChromeDriver
// const chromeDriverUrl = 'https://chromedriver.storage.googleapis.com/114.0.5735.90/chromedriver_linux64.zip';

// // Path to save the downloaded file
// const chromeDriverZip = path.join(__dirname, 'chromedriver.zip');

// // Function to download a file
// const downloadFile = (url, dest, callback) => {
//     const file = fs.createWriteStream(dest);
//     https.get(url, (response) => {
//         response.pipe(file);
//         file.on('finish', () => {
//             file.close(callback);
//         });
//     }).on('error', (err) => {
//         fs.unlink(dest, () => callback(err.message));
//     });
// };

// // Function to extract a zip file
// const extractZip = (filePath, destPath, callback) => {
//     exec(`unzip -o ${filePath} -d ${destPath}`, (err) => {
//         if (err) {
//             return callback(err);
//         }
//         fs.unlink(filePath, callback); // Remove zip file after extraction
//     });
// };

// // Download and extract ChromeDriver
// downloadFile(chromeDriverUrl, chromeDriverZip, (err) => {
//     if (err) {
//         console.error('Failed to download ChromeDriver:', err);
//         process.exit(1);
//     }
//     extractZip(chromeDriverZip, __dirname, (err) => {
//         if (err) {
//             console.error('Failed to extract ChromeDriver:', err);
//             process.exit(1);
//         }
//         console.log('ChromeDriver installed successfully');
//     });
// });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// const { exec } = require('child_process');
// const { get } = require('https');
// const { createWriteStream } = require('fs');
// const path = require('path');

// const chromeDriverVersion = '114.0.5735.90'; // Update this version if needed

// const downloadChromeDriver = (version) => {
//     return new Promise((resolve, reject) => {
//         const url = `https://chromedriver.storage.googleapis.com/${version}/chromedriver_linux64.zip`;
//         const file = path.join(__dirname, 'chromedriver.zip');
//         const fileStream = createWriteStream(file);

//         get(url, (response) => {
//             response.pipe(fileStream);
//             fileStream.on('finish', () => {
//                 fileStream.close(resolve);
//             });
//         }).on('error', (err) => {
//             reject(err);
//         });
//     });
// };

// const extractChromeDriver = () => {
//     return new Promise((resolve, reject) => {
//         // Extract chromedriver.zip into the utils/assets folder
//         const outputPath = path.resolve(__dirname, 'utils/assets');
//         exec(`unzip -o chromedriver.zip -d ${outputPath}`, (err) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve();
//             }
//         });
//     });
// };

// (async () => {
//     try {
//         await downloadChromeDriver(chromeDriverVersion);
//         await extractChromeDriver();
//         console.log('ChromeDriver downloaded and extracted successfully');
//     } catch (error) {
//         console.error('Failed to download or extract ChromeDriver', error);
//     }
// })();

////////////////////////////////////////////////////////////////////////////////////////////////////
const fs = require('fs');
const path = require('path');
const https = require('https');

const downloadChromium = (url, dest, cb) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close(cb);
        });
    }).on('error', (err) => {
        fs.unlink(dest);
        if (cb) cb(err.message);
    });
};

const url = 'https://path.to/chromium';
const dest = path.resolve(__dirname, 'utils/assets/chromedriver');

downloadChromium(url, dest, (err) => {
    if (err) {
        console.error('Error downloading Chromium:', err);
    } else {
        console.log('Chromium downloaded successfully');
    }
});