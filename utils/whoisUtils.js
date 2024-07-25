const whois = require('whois');

const getWhoisInfo = (domain) => {
    return new Promise((resolve, reject) => {
        whois.lookup(domain, (error, result) => {
            if (error) {
                console.error(`Whois lookup failed for ${domain}:`, error.message);
                reject(error);
            } else {
                // console.log(result);
                resolve(result);
            }
        });
    });
}

module.exports = { getWhoisInfo };
