const axios = require("axios").create({ maxRedirects: 10 })

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

  module.exports = {checkIfLive, extractAltNamesFromError}