const { validatePassword } = require('../password');

describe('validatePassword', () => {
  test('returns errors if password does not have at least one uppercase character', () => {
    const passwordErrors = validatePassword('pass123!');
    expect(passwordErrors.length > 0).toBe(true);
    expect(passwordErrors).toContain(
      'password requires at least one uppercase character'
    );
  });

  test('returns errors if password does not have at least one lowercase character', () => {
    const passwordErrors = validatePassword('PASS123!');
    expect(passwordErrors.length > 0).toBe(true);
    expect(passwordErrors).toContain(
      'password requires at least one lowercase character'
    );
  });

  test('returns errors if password does not have at least one special character', () => {
    const passwordErrors = validatePassword('passPASS1');
    expect(passwordErrors.length > 0).toBe(true);
    expect(passwordErrors).toContain(
      'password requires at least one special character'
    );
  });

  test('returns errors if password does not have at least one number', () => {
    const passwordErrors = validatePassword('P@SSpass');
    expect(passwordErrors.length > 0).toBe(true);
    expect(passwordErrors).toContain('password requires at least one number');
  });

  test('returns errors if password length is less than 8 characters', () => {
    const passwordErrors = validatePassword('abc');
    expect(passwordErrors.length > 0).toBe(true);
    expect(passwordErrors).toContain(
      'password requires a minimum length of 8 characters'
    );
  });

  test('returns no errors if password meets criteria', () => {
    const passwordErrors = validatePassword('g$jkKK44Q!');
    expect(passwordErrors.length === 0).toBe(true);
  });
});
