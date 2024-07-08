const acme = require('acme-client');
const fs = require('fs');
const path = require('path');

const generateCertificate = async (domain, email) => {
    const accountKey = await acme.forge.createPrivateKey();
    const client = new acme.Client({
        directoryUrl: acme.directory.letsencrypt.production,
        accountKey
    });

    const [key, csr] = await acme.forge.createCsr({
        commonName: domain
    });

    // const cert = await client.auto({
    //     csr,
    //     email,
    //     termsOfServiceAgreed: true,
    //     challengeCreateFn: () => Promise.resolve(),
    //     challengeRemoveFn: () => Promise.resolve()
    // });

    // const cert = await client.auto({
    //     csr,
    //     email,
    //     termsOfServiceAgreed: true,
    //     challengeCreateFn: (authz, challenge, keyAuthorization) => {
    //         const filePath = path.join('/var/www/html/.well-known/acme-challenge', challenge.token);
    //         fs.writeFileSync(filePath, keyAuthorization);
    //         return Promise.resolve();
    //     },
    //     challengeRemoveFn: (authz, challenge, keyAuthorization) => {
    //         const filePath = path.join('/var/www/html/.well-known/acme-challenge', challenge.token);
    //         fs.unlinkSync(filePath);
    //         return Promise.resolve();
    //     }
    // });


    // const cert = await client.auto({
    //     csr,
    //     email,
    //     termsOfServiceAgreed: true,
    //     challengeCreateFn: async (authz, challenge, keyAuthorization) => {
    //         const challengePath = path.join(__dirname, '../', 'public', '.well-known', 'acme-challenge');
    //         if (!fs.existsSync(challengePath)) {
    //             fs.mkdirSync(challengePath, { recursive: true });
    //         }
    //         const filePath = path.join(challengePath, challenge.token);
    //         fs.writeFileSync(filePath, keyAuthorization);
    //         return Promise.resolve();
    //     },
    //     challengeRemoveFn: async (authz, challenge, keyAuthorization) => {
    //         const filePath = path.join(__dirname, '../', 'public', '.well-known', 'acme-challenge', challenge.token);
    //         if (fs.existsSync(filePath)) {
    //             fs.unlinkSync(filePath);
    //         }
    //         return Promise.resolve();
    //     }
    // });


    const challengePath = path.join(__dirname, '../', 'public', '.well-known', 'acme-challenge');

    const cert = await client.auto({
        csr,
        email,
        termsOfServiceAgreed: true,
        challengeCreateFn: async (authz, challenge, keyAuthorization) => {
            console.log(`Creating challenge file at: ${challengePath}`);
            if (!fs.existsSync(challengePath)) {
                fs.mkdirSync(challengePath, { recursive: true });
            }
            const filePath = path.join(challengePath, challenge.token);
            console.log(`Writing challenge file: ${filePath}`);
            fs.writeFileSync(filePath, keyAuthorization);
            return Promise.resolve();
        },
        challengeRemoveFn: async (authz, challenge, keyAuthorization) => {
            const filePath = path.join(challengePath, challenge.token);
            console.log(`Removing challenge file: ${filePath}`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return Promise.resolve();
        }
    });


    return {
        privateKey: key.toString(),
        certificate: cert.toString()
    };
};

module.exports = generateCertificate