const bcrypt = require('bcrypt');
const User = require('../models/user');
const validator = require('../util/password');

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Email and password must be in the request body
  if (!email || !password) {
    res.status(400).json({ errors: ['Email and password are required'] });
    return;
  }

  // Get user from database
  const user = await User.findOne({ where: { email } });
  if (!user) {
    res.status(401).json({ errors: ['Invalid credentials'] });
    return;
  }

  // Check password matches database record
  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    res.status(401).json({ errors: ['Invalid credentials'] });
    return;
  }

  // Generate user authentication token - convert "email:password" to base64
  const token = 'Basic ' + btoa(`${email}:${user.password}`);

  res.header('Authorization', token).send({ user: { email: user.email } });
};

exports.register = async (req, res, next) => {
  const { email, password } = req.body;

  // Email and password must be sent in the request body
  if (!email || !password) {
    res.status(400).json({ errors: 'Email and password are required' });
    return;
  }

  // Confirm password meets all criteria
  const passwordErrors = validator.validatePassword(password);
  if (passwordErrors.length > 0) {
    res.status(400).json({ errors: passwordErrors });
    return;
  }

  // Prepare password for secure storage
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    // Create a new user record with provided credentials
    const user = await User.create({ email, password: hashedPassword });
  } catch (err) {
    // TODO check error type is database validation - re throw error if not

    // Handle errors if database contstaints are not met
    const errorMessages = err.errors.map((error) => error.message);
    res.status(400).json({ errors: errorMessages });
    return next();
  }

  // Generate user authentication token - onvert email:password to base64
  const token = 'Basic ' + btoa(`${email}:${hashedPassword}`);

  res.status(201).header('Authorization', token).json({ user: { email } });
};
