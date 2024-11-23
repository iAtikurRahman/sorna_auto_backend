require("dotenv").config();
const jwt = require('jsonwebtoken');
const rp = require('request-promise');
const jwksClient = require('jwks-rsa');

const ServerAuthorization = (req, res, next) => {
    const options = {
        method: 'POST',
        url: process.env.SERVER_VALIDATION_URL,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            grant_type: process.env.SERVER_VALIDATION_grant_type,
            client_id: process.env.SERVER_VALIDATION_client_id,
            client_secret: process.env.SERVER_VALIDATION_client_secret
        },
        secureProtocol: 'TLSv1_2_method'
    };

    rp(options)
        .then((response) => {
            const token = JSON.parse(response).access_token;
            var accessToken = token;

            const client = jwksClient({
                jwksUri: process.env.SERVER_VALIDATION_jwksUri
            });

            function getKey(header, callback) {
                client.getSigningKey(header.kid, function (err, key) {
                    if (err || !key) {
                        return callback(new Error('Key not found in JWKS'));
                    }
                    const signingKey = key.publicKey || key.rsaPublicKey;
                    callback(null, signingKey);
                });
            }

            jwt.verify(accessToken, getKey, function (err, decoded) {
                if (err) {
                    if (err instanceof jwt.TokenExpiredError) {
                        return res.status(401).json({ error: 'Server Token has expired.' });
                    } else {
                        return res.status(401).json({ error: 'Server Token is invalid.' });
                    }
                } else {
                    // Move the 'next()' call outside of the 'else' block
                    next();
                }
            });
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        });
};

module.exports = {
    ServerAuthorization
};
