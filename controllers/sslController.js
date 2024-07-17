const {
  generateCertificate,
  verifyChallengeAndGetCertificate,
} = require("../utils/generateCertificate");

const certificate = async (req, res) => {
  const { domain, email } = req.body;
  console.log(`Domain recieved:${domain}, email received:${email}`);

  if (!domain || !email) {
    console.log("Domain and email are required");
    return res.status(400).json({ error: "Domain and email are required" });
  }

  try {
    const challengeData = await generateCertificate(domain, email);
    console.log(
      "Challenge file generated, sending reponse to frontend",
      challengeData
    );
    res.json({
      message:
        "Challenge file generated. Please download and place it in your website’s .well-known/acme-challenge directory.",
      challengeData,
    });
  } catch (error) {
    console.error("Error generating SSL certificate:", error);
    res.status(500).json({ error: "Failed to generate SSL certificate" });
  }
};

const verifyDomain = async (req, res) => {
  const { challengeData, domain } = req.body;

  console.log("Verifyying Challengedata", challengeData);

  if (!challengeData) {
    console.log("Challenge data is required");
    return res.status(400).json({ error: "Challenge data is required" });
  }

  console.log(`testing verification process`);
  try {
    const sslCertificate = await verifyChallengeAndGetCertificate(
      challengeData,
      domain
    );
    console.log(`verification success`);
    res.json({ sslCertificate });
  } catch (error) {
    console.error("Error verifying SSL certificate:", error);
    res.status(500).json({ error: "Failed to verify SSL certificate" });
  }
};

module.exports = {
  certificate,
  verifyDomain,
};
