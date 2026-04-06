const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Call this before every API request instead of setCredentials directly
async function getAuthenticatedClient(tokens) {
    oauth2Client.setCredentials(tokens);

    // Check if the access token is expired or about to expire (within 5 min)
    const expiryDate = tokens.expiry_date;
    const isExpired  = expiryDate ? Date.now() >= expiryDate - 5 * 60 * 1000 : true;

    if (isExpired) {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);
        // Return the new tokens so the caller can persist them
        return { client: oauth2Client, newTokens: credentials };
    }

    return { client: oauth2Client, newTokens: null };
}

module.exports = { oauth2Client, getAuthenticatedClient };