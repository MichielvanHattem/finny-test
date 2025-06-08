const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

async function getAppToken() {
    const { ConfidentialClientApplication } = require('@azure/msal-node');

    const config = {
        auth: {
            clientId: process.env.AZURE_CLIENT_ID,
            authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
            clientSecret: process.env.AZURE_CLIENT_SECRET
        }
    };

    const cca = new ConfidentialClientApplication(config);

    const tokenRequest = {
        scopes: ["https://graph.microsoft.com/.default"],
    };

    try {
        const response = await cca.acquireTokenByClientCredential(tokenRequest);
        return response.accessToken;
    } catch (error) {
        console.error("Token ophalen mislukt", error);
        throw new Error("Token ophalen mislukt");
    }
}

async function getGraphClient() {
    const token = await getAppToken();
    return Client.init({
        authProvider: (done) => {
            done(null, token);
        }
    });
}

async function getSharePointFiles() {
    const graphClient = await getGraphClient();

    try {
        const result = await graphClient
            .api('/me/drive/root:/FinnyTest:/children')
            .get();

        return result.value;
    } catch (error) {
        console.error("Graph API-fout:", error);
        throw error;
    }
}

module.exports = { getSharePointFiles };
