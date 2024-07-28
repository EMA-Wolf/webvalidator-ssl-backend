const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const downloadFile = (url, outputPath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(outputPath, () => {});
            reject(err);
        });
    });
};

const installDrivers = async () => {
    try {
        const platform = process.platform;
        const arch = process.arch;

        let geckoDriverUrl;
        let chromeDriverUrl;

        if (platform === 'linux' && arch === 'x64') {
            geckoDriverUrl = 'https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-linux64.tar.gz';
            chromeDriverUrl = 'https://chromedriver.storage.googleapis.com/91.0.4472.19/chromedriver_linux64.zip';
        } else if (platform === 'darwin' && arch === 'x64') {
            geckoDriverUrl = 'https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-macos.tar.gz';
            chromeDriverUrl = 'https://chromedriver.storage.googleapis.com/91.0.4472.19/chromedriver_mac64.zip';
        } else {
            throw new Error('Unsupported platform or architecture');
        }

        const geckoDriverPath = path.join(__dirname, 'geckodriver.tar.gz');
        const chromeDriverPath = path.join(__dirname, 'chromedriver.zip');

        await downloadFile(geckoDriverUrl, geckoDriverPath);
        await downloadFile(chromeDriverUrl, chromeDriverPath);

        exec(`tar -xzf ${geckoDriverPath} -C ${__dirname}`, (err) => {
            if (err) throw err;
            console.log('GeckoDriver installed');
        });

        exec(`unzip -o ${chromeDriverPath} -d ${__dirname}`, (err) => {
            if (err) throw err;
            console.log('ChromeDriver installed');
        });
    } catch (err) {
        console.error('Error installing drivers:', err);
    }
};

installDrivers();
