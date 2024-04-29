const User = require('../models/user');

exports.authenticate = async (req, res, next) => {
  try {
    // Check for Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res
        .status(401)
        .set('WWW-Authenticate', 'Basic')
        .json({ errors: ['Invalid credentials'] });
      return;
    }

    let decodedEmail, decodedPasswordHash;
    try {
      // Decode the 'Authorization' header Base64 value to retrieve email and password
      const authToken = authHeader.replace('Basic ', '');
      const decodedAuthToken = atob(authToken);
      [decodedEmail, decodedPasswordHash] = decodedAuthToken.split(':');
    } catch {
      // Credentials are invalid if token cannot be decoded
      res
        .status(401)
        .set('WWW-Authenticate', 'Basic')
        .json({ errors: ['Invalid credentials'] });
      return;
    }

    // Find user in database
    const user = await User.findOne({ where: { email: decodedEmail } });

    // Check user exists and passwords match
    if (!user || user.password !== decodedPasswordHash) {
      res
        .status(401)
        .set('WWW-Authenticate', 'Basic')
        .json({ errors: ['Invalid credentials'] });
      return;
    }

    // Add user email to request object to be passed to the controller
    req.user = user;

    res.status(200);
    next();
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
};
