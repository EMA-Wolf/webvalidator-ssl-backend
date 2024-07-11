const acme = require('acme-client');
const fs = require('fs');
const path = require('path');

// const generateCertificate = async (domain, email) => {
//     const accountKey = await acme.forge.createPrivateKey();
//     const client = new acme.Client({
//         directoryUrl: acme.directory.letsencrypt.production,
//         accountKey
//     });

//     const [key, csr] = await acme.forge.createCsr({
//         commonName: domain
//     });

//     // const cert = await client.auto({
//     //     csr,
//     //     email,
//     //     termsOfServiceAgreed: true,
//     //     challengeCreateFn: () => Promise.resolve(),
//     //     challengeRemoveFn: () => Promise.resolve()
//     // });

//     // const cert = await client.auto({
//     //     csr,
//     //     email,
//     //     termsOfServiceAgreed: true,
//     //     challengeCreateFn: (authz, challenge, keyAuthorization) => {
//     //         const filePath = path.join('/var/www/html/.well-known/acme-challenge', challenge.token);
//     //         fs.writeFileSync(filePath, keyAuthorization);
//     //         return Promise.resolve();
//     //     },
//     //     challengeRemoveFn: (authz, challenge, keyAuthorization) => {
//     //         const filePath = path.join('/var/www/html/.well-known/acme-challenge', challenge.token);
//     //         fs.unlinkSync(filePath);
//     //         return Promise.resolve();
//     //     }
//     // });


//     // const cert = await client.auto({
//     //     csr,
//     //     email,
//     //     termsOfServiceAgreed: true,
//     //     challengeCreateFn: async (authz, challenge, keyAuthorization) => {
//     //         const challengePath = path.join(__dirname, '../', 'public', '.well-known', 'acme-challenge');
//     //         if (!fs.existsSync(challengePath)) {
//     //             fs.mkdirSync(challengePath, { recursive: true });
//     //         }
//     //         const filePath = path.join(challengePath, challenge.token);
//     //         fs.writeFileSync(filePath, keyAuthorization);
//     //         return Promise.resolve();
//     //     },
//     //     challengeRemoveFn: async (authz, challenge, keyAuthorization) => {
//     //         const filePath = path.join(__dirname, '../', 'public', '.well-known', 'acme-challenge', challenge.token);
//     //         if (fs.existsSync(filePath)) {
//     //             fs.unlinkSync(filePath);
//     //         }
//     //         return Promise.resolve();
//     //     }
//     // });


//     const challengePath = path.join(__dirname, '../', 'public', '.well-known', 'acme-challenge');

//     // const cert = await client.auto({
//     //     csr,
//     //     email,
//     //     termsOfServiceAgreed: true,
//     //     challengeCreateFn: async (authz, challenge, keyAuthorization) => {
//     //         console.log(`Creating challenge file at: ${challengePath}`);
//     //         if (!fs.existsSync(challengePath)) {
//     //             fs.mkdirSync(challengePath, { recursive: true });
//     //         }
//     //         const filePath = path.join(challengePath, challenge.token);
//     //         console.log(`Writing challenge file: ${filePath}`);
//     //         fs.writeFileSync(filePath, keyAuthorization);
//     //         return Promise.resolve();
//     //     },
//     //     challengeRemoveFn: async (authz, challenge, keyAuthorization) => {
//     //         const filePath = path.join(challengePath, challenge.token);
//     //         console.log(`Removing challenge file: ${filePath}`);
//     //         if (fs.existsSync(filePath)) {
//     //             fs.unlinkSync(filePath);
//     //         }
//     //         return Promise.resolve();
//     //     }
//     // });

//     const cert = await client.auto({
//         csr,
//         email,
//         termsOfServiceAgreed: true,
//         challengeCreateFn: async (authz, challenge, keyAuthorization) => {
//             console.log(`Creating challenge file at: ${challengePath}`);
//             if (!fs.existsSync(challengePath)) {
//                 fs.mkdirSync(challengePath, { recursive: true });
//             }
//             const filePath = path.join(challengePath, challenge.token);
//             console.log(`Writing challenge file: ${filePath}`);
//             fs.writeFileSync(filePath, keyAuthorization);

//             // Send the challenge details to the frontend
//             res.json({
//                 token: challenge.token,
//                 keyAuthorization
//             });

//             // Wait for frontend to confirm the file has been uploaded
//             return new Promise(resolve => {
//                 const interval = setInterval(() => {
//                     if (fs.existsSync(filePath)) {
//                         clearInterval(interval);
//                         resolve();
//                     }
//                 }, 1000);
//             });
//         },
//         challengeRemoveFn: async (authz, challenge, keyAuthorization) => {
//             const filePath = path.join(challengePath, challenge.token);
//             console.log(`Removing challenge file: ${filePath}`);
//             if (fs.existsSync(filePath)) {
//                 fs.unlinkSync(filePath);
//             }
//             return Promise.resolve();
//         }
//     });


//     return {
//         privateKey: key.toString(),
//         certificate: cert.toString()
//     };
// };

// const generateCertificate = async (domain, email) => {
 

//     const ackey = await acme.forge.createPrivateKey();

//     const client = new acme.Client({
//         directoryUrl:acme.directory.letsencrypt.production,
//         accountKey:ackey
//     });

//        // Registering account
//      await client.createAccount({
//         termsOfServiceAgreed: true,
//         contact: [`mailto:${email}`]
//     });

//     const [key, csr] = await acme.forge.createCsr({
//         commonName: domain 
//     });

//     const order = await client.createOrder({ identifiers: [{ type: 'dns', value: domain }] });
//     const authorizations = await client.getAuthorizations(order);
//     const challenges = authorizations.map(auth => auth.challenges.find(ch => ch.type === 'http-01'));

//     const files = await Promise.all(challenges.map(async challenge => {
//         const keyAuthorization = await client.getChallengeKeyAuthorization(challenge);
//         return {
//             token: challenge.token,
//             keyAuthorization
//         };
//     }));

//     return {
//         privateKey: key.toString(),
//         csr: csr.toString(),
//         files,
//         challenges,
//         order,
//         accountKey:ackey
//     };
// };

// const verifyChallengeAndGetCertificate = async (domain,challenges, order, accountKey, csr) => {
//     const client = new acme.Client({
//         directoryUrl: acme.directory.letsencrypt.production,
//         accountKey
//     });

//     for (const challenge of challenges) {
//         console.log(`Verifying challenge for domain: ${domain}, challenge: ${JSON.stringify(challenge)}`);
//         await client.verifyChallenge(order, challenge);
//         await client.completeChallenge(challenge);
//     }

//     await client.waitForValidStatus(order);

//     const cert = await client.finalizeOrder(order, csr);

//     return cert.toString();
// };

const generateCertificate = async(domain,email) =>{
    const client = new acme.Client({
        directoryUrl: acme.directory.letsencrypt.staging, // Use staging for testing, change to production for real certificates
        accountKey: await acme.forge.createPrivateKey()
    });

    await client.createAccount({
        termsOfServiceAgreed: true,
        contact: [`mailto:${email}`]
    });

    const order = await client.createOrder({
        identifiers: [{ type: 'dns', value: domain }]
    });

    const [authorization] = await client.getAuthorizations(order);

    const httpChallenge = authorization.challenges.find(chal => chal.type === 'http-01');
    const keyAuthorization = await client.getChallengeKeyAuthorization(httpChallenge)
    console.log("httpChallenge:",httpChallenge)

    const challengeDir = path.join(__dirname, 'ssl', '.well-known', 'acme-challenge');
    if (!fs.existsSync(challengeDir)) {
        fs.mkdirSync(challengeDir, { recursive: true });
    }

    const challengeFilePath = path.join(challengeDir, httpChallenge.token);
    // console.log('challengeFilePath:', challengeFilePath); // Debugging line
    // console.log('typeof challengeFilePath:', typeof challengeFilePath); // Debugging line
    // console.log('httpChallenge.keyAuthorization:', httpChallenge.keyAuthorization); // Debugging line
    // console.log('typeof httpChallenge.keyAuthorization:', typeof httpChallenge.keyAuthorization); // Debugging line


    // fs.writeFileSync(challengeFilePath, httpChallenge.keyAuthorization);

    return {
        order,
        authorization,
        httpChallenge,
        keyAuthorization,
        csr: await acme.forge.createCsr({
            commonName: domain
        })
    };
}


const verifyChallengeAndGetCertificate = async ({ order, authorization, httpChallenge, keyAuthorization, csr })=>{
    const client = new acme.Client({
        directoryUrl: acme.directory.letsencrypt.staging,
        accountKey: await acme.forge.createPrivateKey()
    });

    await client.verifyChallenge(authorization, httpChallenge);
    await client.completeChallenge(httpChallenge);
    await client.waitForValidStatus(order);
    await client.finalizeOrder(order, csr)

    const certificate = await client.getCertificate(order) ;

    return {
        privateKey: keyAuthorization.toString(),
        certificate: certificate.cert
    };
}

module.exports = {
    generateCertificate,
    verifyChallengeAndGetCertificate
}
