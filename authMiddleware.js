
const adminAuth = require('./firebaseAdmin');

const verifyAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        const idToken = authHeader.substring(7);
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const adminEmail = process.env.ADMIN_EMAIL;

        if (
            !adminEmail ||
            !decodedToken.email ||
            decodedToken.email.toLowerCase() !== adminEmail.toLowerCase()
        ) {
            return res.status(403).json({
                message: 'Admin access only'
            });
        }

        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        return res.status(401).json({
            message: 'Invalid or expired authentication token'
        });
    }
};

module.exports = verifyAdmin;
