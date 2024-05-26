const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) => {
    //first check request headers has authrization or not
    const authrization = req.headers.authrization
    if (!authrization) return res.status(401).json({ error: "Token not found" });


    //Extract the JWT token from the request headers
    const token = req.headers.authrization.split('')(1);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        //verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Attach user information to the request object
        res.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: 'Invalid token' })
    }
}


//generate JWT token
const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: 30000 });
}

module.exports = { jwtAuthMiddleware, generateToken };