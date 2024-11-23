const checkRequiredHeaders = (req, res, next) => {
    // Check if the required headers are present
    if (!req.headers['authorization']) {
      return res.status(401).json({ status:'401' , message: 'server is running', error: 'Token not found.' });
    }
    next();
  };


module.exports = {checkRequiredHeaders};