const {generateCertificate,verifyChallengeAndGetCertificate} = require("../utils/generateCertificate")

const certificate = async (req, res) =>{
    const {domain, email} = req.body
    console.log(`Recevied domain: ${domain} for email: ${email}`)

    if(!domain && !email){
        console.log(`Domain and email are required`)
        return res.status(400).json({error:"Domain and email are required"})
    }

    console.log(`Generating certificate for ${domain}`)
    try{
        const { files, challenges, order, privateKey, csr,accountKey }= await generateCertificate(domain, email);
        req.app.set('challenges', challenges);
        req.app.set('order', order);
        req.app.set('privateKey', privateKey);
        req.app.set('csr', csr);
        req.app.set('accountKey', accountKey);

        console.log(`Sending certificate to the frontend`)
        res.json({ files, verificationLinks: files.map(file => `http://${domain}/.well-known/acme-challenge/${file.token}`) });
    }catch(err){
        console.log(`Error generating certificate`, err)
        res.json({error:"Failed to generate certificate"})
    }
} 

const verifyDomain = async (req, res) => {
    const { domain } = req.body;
    const challenges = req.app.get('challenges');
    const order = req.app.get('order');
    const privateKey = req.app.get('privateKey');
    const csr = req.app.get('csr');
    // const accountKey= req.app.get('accountKey');

    if (!challenges || !order || !privateKey || !csr) {
        return res.status(400).json({ error: "No challenge found for domain verification" });
    }

    try {
        const cert = await verifyChallengeAndGetCertificate(domain, challenges, order, privateKey, csr);
        res.json({ message: "Domain verified and SSL Certificate generated successfully", certificate: cert });
    } catch (err) {
        console.log(`Error verifying domain`, err);
        res.json({ error: "Failed to verify domain" });
    }
};

module.exports = {
    certificate, 
    verifyDomain
}