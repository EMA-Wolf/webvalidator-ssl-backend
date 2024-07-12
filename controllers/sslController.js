const {generateCertificate,verifyChallengeAndGetCertificate} = require("../utils/generateCertificate")

// const certificate = async (req, res) =>{
//     const {domain, email} = req.body
//     console.log(`Recevied domain: ${domain} for email: ${email}`)

//     if(!domain && !email){
//         console.log(`Domain and email are required`)
//         return res.status(400).json({error:"Domain and email are required"})
//     }

//     console.log(`Generating certificate for ${domain}`)
//     try{
//         const { files, challenges, order, privateKey, csr,accountKey }= await generateCertificate(domain, email);
//         req.app.set('challenges', challenges);
//         req.app.set('order', order);
//         req.app.set('privateKey', privateKey);
//         req.app.set('csr', csr);
//         req.app.set('accountKey', accountKey);

//         console.log(`Sending certificate to the frontend`)
//         // res.json({ files, verificationLinks: files.map(file => `http://${domain}/.well-known/acme-challenge/${file.token}.txt`) });
//         res.json({ files });
//     }catch(err){
//         console.log(`Error generating certificate`, err)
//         res.json({error:"Failed to generate certificate"})
//     }
// } 

// const verifyDomain = async (req, res) => {
//     const { domain } = req.body;
//     const challenges = req.app.get('challenges');
//     const order = req.app.get('order');
//     const privateKey = req.app.get('privateKey');
//     const csr = req.app.get('csr');
//     const accountKey= req.app.get('accountKey');

//     if (!challenges || !order || !privateKey || !csr) {
//         console.log('Missing required verification data');
//         return res.status(400).json({ error: "No challenge found for domain verification" });
//     }

//     console.log(`Sending verification request`)
//     try {
//         const cert = await verifyChallengeAndGetCertificate(domain,challenges, order, accountKey, csr);
//         console.log("Domain verified and SSL Certificate generated successfully")
//         res.json({ message: "Domain verified and SSL Certificate generated successfully", privateKey, certificate: cert });
//     } catch (err) {
//         console.log(`Error verifying domain`, err);
//         res.json({ error: "Failed to verify domain" });
//     }
// };


const certificate = async(req,res)=>{
    const { domain, email } = req.body;
    console.log(`Domain recieved:${domain}, email received:${email}`)

    if (!domain || !email) {
        console.log('Domain and email are required')
        return res.status(400).json({ error: 'Domain and email are required' });
    }


    try {
        const challengeData = await generateCertificate(domain, email);
        console.log('Challenge file generated, sending reponse to frontend',challengeData)
        res.json({
            message: 'Challenge file generated. Please download and place it in your website’s .well-known/acme-challenge directory.',
            challengeData
        });
    } catch (error) {
        console.error('Error generating SSL certificate:', error);
        res.status(500).json({ error: 'Failed to generate SSL certificate' });
    }
}

const verifyDomain = async(req,res) =>{
    const { challengeData, domain } = req.body;

    console.log('Verifyying Challengedata',challengeData)

    if (!challengeData) {
        console.log('Challenge data is required')
        return res.status(400).json({ error: 'Challenge data is required' });
    }

    console.log(`testing verification process`)
    try {
        const sslCertificate = await  verifyChallengeAndGetCertificate(challengeData,domain);
        console.log(`verification success`)
        res.json({sslCertificate});
    } catch (error) {
        console.error('Error verifying SSL certificate:', error);
        res.status(500).json({ error: 'Failed to verify SSL certificate' });
    }
}


module.exports = {
    certificate, 
    verifyDomain
}