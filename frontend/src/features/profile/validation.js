export const validatePassword = (password) => {
  const rules = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const errors = Object.entries(rules)
    .filter(([_, isValid]) => !isValid)
    .map(([rule]) => {
      switch(rule) {
        case 'minLength': return 'Password must be at least 8 characters long';
        case 'hasUpperCase': return 'Password must contain at least one uppercase letter';
        case 'hasLowerCase': return 'Password must contain at least one lowercase letter';
        case 'hasNumber': return 'Password must contain at least one number';
        case 'hasSpecialChar': return 'Password must contain at least one special character';
        default: return '';
      }
    });

  return {
    isValid: errors.length === 0,
    errors
  };
};