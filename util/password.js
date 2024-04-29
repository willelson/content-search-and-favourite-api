exports.validatePassword = (password) => {
  const errors = [];
  const passwordCriteria = [
    {
      description: 'At least one uppercase character',
      test: (password) => /[A-Z]/.test(password)
    },
    {
      description: 'At least one lowercase character',
      test: (password) => /[a-z]/.test(password)
    },
    {
      description: 'At least one number',
      test: (password) => /[0-9]/.test(password)
    },
    {
      description: 'At least one special character',
      test: (password) => /[^A-Za-z0-9]/.test(password)
    },
    {
      description: 'A minimum length of 8 characters',
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
