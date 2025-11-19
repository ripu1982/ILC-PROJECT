const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_me';


module.exports = (req, res, next) => {
try {
const token = req.cookies.token || '';
if (!token) return res.status(401).json({ message: 'Unauthorized' });
const decoded = jwt.verify(token, JWT_SECRET);
req.user = decoded;
next();
} catch (err) {
return res.status(401).json({ message: 'Invalid token' });
}
};