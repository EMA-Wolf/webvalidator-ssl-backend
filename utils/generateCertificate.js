const acme = require('acme-client');

let client;
let accountKey;

const initializeClient = async (email) => {
    if (!client) {
        accountKey = await acme.forge.createPrivateKey();
        client = new acme.Client({
            directoryUrl: acme.directory.letsencrypt.production,
            accountKey
        });

        await client.createAccount({
            termsOfServiceAgreed: true,
            contact: [`mailto:${email}`]
        });
    }
};

const generateCertificate = async(domain,email) =>{
    await initializeClient(email);

    const order = await client.createOrder({
        identifiers: [{ type: 'dns', value: domain }]
    });

    const [authorization] = await client.getAuthorizations(order);

    const httpChallenge = authorization.challenges.find(chal => chal.type === 'http-01');
    const keyAuthorization = await client.getChallengeKeyAuthorization(httpChallenge)

    
    console.log("httpChallenge:",httpChallenge)

 
    return {
        order,
        authorization,
        httpChallenge,
        keyAuthorization,
    };
}


const verifyChallengeAndGetCertificate = async ({ order, authorization, httpChallenge},domain)=>{

  
    await client.verifyChallenge(authorization, httpChallenge);
    await client.completeChallenge(httpChallenge);
    await client.waitForValidStatus(order);
  


    const [key, csr] = await acme.crypto.createCsr({
        altNames:[domain],
    });

   const finalized = await client.finalizeOrder(order, csr)

    const certificate = await client.getCertificate(finalized) ;

    return {
        privateKey: key.toString(),
        certificate: certificate.toString()
    };
}

module.exports = {
    generateCertificate,
    verifyChallengeAndGetCertificate
}
