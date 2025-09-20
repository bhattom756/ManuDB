// Additional validation utilities for enhanced form validation

export const validateEmailDomain = (email) => {
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'];
  const domain = email.split('@')[1];
  return commonDomains.includes(domain?.toLowerCase());
};

export const validatePasswordCommon = (password) => {
  const commonPasswords = [
    'password', '123456', 'password123', 'admin', 'qwerty',
    'letmein', 'welcome', 'monkey', '1234567890', 'abc123'
  ];
  return !commonPasswords.includes(password.toLowerCase());
};

export const validateNameFormat = (name) => {
  // Check for repeated characters (more than 3 in a row)
  const hasRepeatedChars = /(.)\1{3,}/.test(name);
  
  // Check for numbers at the beginning
  const startsWithNumber = /^\d/.test(name);
  
  // Check for special characters (except allowed ones)
  const hasInvalidChars = /[^a-zA-Z\s'-]/.test(name);
  
  return {
    hasRepeatedChars,
    startsWithNumber,
    hasInvalidChars,
    isValid: !hasRepeatedChars && !startsWithNumber && !hasInvalidChars
  };
};

export const getPasswordStrengthScore = (password) => {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
    notCommon: validatePasswordCommon(password),
    notSequential: !/(123|abc|qwe|asd|zxc)/i.test(password),
    notRepeated: !/(.)\1{2,}/.test(password)
  };
  
  score = Object.values(checks).filter(Boolean).length;
  
  let strength = 'very-weak';
  if (score >= 6) strength = 'strong';
  else if (score >= 4) strength = 'medium';
  else if (score >= 2) strength = 'weak';
  
  return { checks, score, strength };
};

export const validateFormSubmission = (formData, schema) => {
  try {
    schema.parse(formData);
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    error.errors?.forEach((err) => {
      errors[err.path[0]] = err.message;
    });
    return { isValid: false, errors };
  }
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[<>]/g, ''); // Remove potential HTML tags
};

export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  } = options;
  
  const errors = [];
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }
  
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension must be one of: ${allowedExtensions.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
