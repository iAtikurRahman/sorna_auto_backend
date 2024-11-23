const jwt = require('jsonwebtoken');



const isValidRequestFromClient = (req, res, next) => {
    const str = req.headers.authorization;
    if (req.headers.authorization === undefined) {
        return res.status(401).json({ status:'401' , error: 'Token not found.' }); 
    }
    let nStrToken = str.replace(/Bearer/g,' ');
    nStrToken = nStrToken.trim();
    const decodedClientToken = jwt.decode(nStrToken);
    if (!decodedClientToken){
        return res.status(401).json({ status:'401' , error: 'Token is invalid.' }); 
      } 
    const expiryTime = decodedClientToken?.exp;
    const currentTime = Math.floor((Date.now() - 60 * 60 * 24 * 1000) / 1000);
    let timeValidationOk = true;
    if (expiryTime < currentTime){
      timeValidationOk = false;
      return res.status(401).json({ status:'401' , error: 'Token has expired.' }); 
    } 
    if(timeValidationOk){
        next(); 
    }
}

module.exports = {
    isValidRequestFromClient
};

