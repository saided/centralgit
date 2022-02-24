const jwt = require('jsonwebtoken');
const createError = require('http-errors')

module.exports = {
    signAccessToken: (user) => {
        return new Promise((resolve, reject) => {
            const payload = {
            }
            const secret = process.env.ACCESS_TOKEN_SECRET
            const options = {
                expiresIn: '2m',
                issuer: "sai",
                audience: user
            }
            jwt.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message);
                    reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    validateToken: (req, res, next) => {
        console.log(req.payload);
        if (!req.headers.authorization) return next(createError.Unauthorized())
        const token = req.headers.authorization.split(' ')[1]
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            console.log(payload);
            if (err) {
                console.log(err);
                const errMsg = err.name == 'TokenExpiredError' ? 'TOKEN_EXPIRED' : err.message
                return next(createError.Unauthorized(errMsg))
            }
            req.payload = payload
            next()

        })
    }
}