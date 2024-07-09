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

const generateCertificate = async (domain, email) => {
 

    const ackey = await acme.forge.createPrivateKey();

    const client = new acme.Client({
        directoryUrl:acme.directory.letsencrypt.production,
        accountKey:ackey
    });

       // Registering account
     await client.createAccount({
        termsOfServiceAgreed: true,
        contact: [`mailto:${email}`]
    });

    const [key, csr] = await acme.forge.createCsr({
        commonName: domain 
    });

    const order = await client.createOrder({ identifiers: [{ type: 'dns', value: domain }] });
    const authorizations = await client.getAuthorizations(order);
    const challenges = authorizations.map(auth => auth.challenges.find(ch => ch.type === 'http-01'));

    const files = challenges.map(challenge => ({
        token: challenge.token,
        keyAuthorization: client.getChallengeKeyAuthorization(challenge)
    }));

    return {
        privateKey: key.toString(),
        csr: csr.toString(),
        files,
        challenges,
        order,
        accountKey:ackey
    };
};

const verifyChallengeAndGetCertificate = async (domain, challenges, order, accountKey, csr) => {
    const client = new acme.Client({
        directoryUrl: acme.directory.letsencrypt.production,
        accountKey
    });

    for (const challenge of challenges) {
        await client.verifyChallenge(order, challenge);
        await client.completeChallenge(challenge);
    }

    await client.waitForValidStatus(order);

    const cert = await client.finalizeOrder(order, csr);

    return cert.toString();
};

module.exports = {
    generateCertificate,
    verifyChallengeAndGetCertificate
}
