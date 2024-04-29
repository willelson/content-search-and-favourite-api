exports.validatePassword = (password) => {
  const errors = [];
  const passwordCriteria = [
    {
      description: 'password requires at least one uppercase character',
      test: (password) => /[A-Z]/.test(password)
    },
    {
      description: 'password requires at least one lowercase character',
      test: (password) => /[a-z]/.test(password)
    },
    {
      description: 'password requires at least one number',
      test: (password) => /[0-9]/.test(password)
    },
    {
      description: 'password requires at least one special character',
      test: (password) => /[^A-Za-z0-9]/.test(password)
    },
    {
      description: 'password requires a minimum length of 8 characters',
      test: (password) => password.length >= 8
    }
  ];

  passwordCriteria.forEach((criteria) => {
    if (!criteria.test(password)) {
      errors.push(criteria.description);
    }
  });

  return errors;
};

/**
 * Takes a string or integer as an argument and checks if it's a valid integer
 */
exports.isValidInteger = (testCase) => /^\d+$/.test(String(testCase));
