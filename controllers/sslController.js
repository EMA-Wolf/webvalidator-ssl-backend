const generateCertificate = require("../utils/generateCertificate")

const certificate = async (req, res) =>{
    const {domain, email} = req.body
    console.log(`Recevied domain: ${domain} for email: ${email}`)

    if(!domain && !email){
        console.log(`Domain and email are required`)
        return res.status(400).json({error:"Domain and email are required"})
    }

    console.log(`Generating certificate for ${domain}`)
    try{
        const certificateData = await generateCertificate(domain, email);
        console.log(`Sending certificate to the frontend`)
        res.json({cert:certificateData});
    }catch(err){
        console.log(`Error generating certificate`, err)
        res.json({error:"Failed to generate certificate"})
    }
} 

module.exports = {
    certificate
}