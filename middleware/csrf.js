const { doubleCsrf } = require('csrf-csrf');

const CSRF_SECRET = process.env.CSRF_SECRET;

if (!CSRF_SECRET || CSRF_SECRET.length < 32) {
    throw new Error('CSRF_SECRET must be defined and at least 32 characters long');
}

const {
    generateToken,
    validateRequest,
    doubleCsrfProtection,
} = doubleCsrf({
    getSecret: () => {
        return CSRF_SECRET;
    },
    cookieName: "x-csrf-token",
    cookieOptions: { 
        sameSite: "strict",
        secure: false,
    },
    size: 64,
    ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    getSessionIdentifier: (req) => {
        const sessionId = req.sessionID || "";
        return sessionId;
    },
    getTokenFromRequest: (req) => {
        const token = req.body._csrf || req.headers['x-csrf-token'];
        return token;
    },
});

module.exports = {
    generateToken,
    validateRequest,
    csrfProtection: doubleCsrfProtection,
};