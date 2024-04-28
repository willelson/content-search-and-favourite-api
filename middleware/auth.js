const User = require('../models/user');
const bcrypt = require('bcrypt');

exports.authenticate = async (req, res, next) => {
  // Check for Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.status(401).set('WWW-Authenticate', 'Basic');
    return;
  }

  // Decode the 'Authorization' header Base64 value to retrieve email and password
  const authToken = authHeader.slice(6);
  const decodedAuthToken = atob(authToken);
  const [decodedEmail, decodedPasswordHash] = decodedAuthToken.split(':');

  // Find user in database
  const user = await User.findOne({ where: { email: decodedEmail } });

  if (!user) {
    res.status(401).set('WWW-Authenticate', 'Basic');
    return;
  }

  if (user.password !== decodedPasswordHash) {
    res.status(401).set('WWW-Authenticate', 'Basic');
    return;
  }

  // Add user email to request object to be passed to the controller
  req.user = { email: decodedEmail };

  res.status(200);
  next();
};
