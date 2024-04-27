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
  const [retrievedEmail, retrievedPass] = decodedAuthToken.split(':');

  // Find user in database
  const user = await User.findOne({ where: { email: retrievedEmail } });

  if (!user) {
    res.status(401).send('Invalid credentials');
    return;
  }

  if (user.password !== retrievedPass) {
    res.status(401).set('WWW-Authenticate', 'Basic');
    return;
  }

  res.status(200);
  next();
};
