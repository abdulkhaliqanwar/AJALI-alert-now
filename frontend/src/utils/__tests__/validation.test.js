import {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateRequired,
  validateLength,
  validateNumeric,
  validateAlphabetic,
  validateAlphanumeric,
  validateURL,
  validateDate,
  validateTime,
  validateDateTime,
  validateFileSize,
  validateFileType,
  validateForm
} from '../validation';

describe('Form Validation Utilities', () => {
  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('@missing-local.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should validate correct passwords', () => {
      expect(validatePassword('Password123!')).toBe(true);
      expect(validatePassword('Complex1Pass!')).toBe(true);
    });

    it('should reject invalid passwords', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('no-uppercase123!')).toBe(false);
      expect(validatePassword('NO-LOWERCASE123!')).toBe(false);
      expect(validatePassword('NoSpecialChar123')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('Phone Number Validation', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhoneNumber('+254712345678')).toBe(true);
      expect(validatePhoneNumber('0712345678')).toBe(true);
      expect(validatePhoneNumber('254712345678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('invalid')).toBe(false);
      expect(validatePhoneNumber('123')).toBe(false);
      expect(validatePhoneNumber('')).toBe(false);
    });
  });

  describe('Required Field Validation', () => {
    it('should validate required fields', () => {
      expect(validateRequired('test')).toBe(true);
      expect(validateRequired(0)).toBe(true);
      expect(validateRequired(false)).toBe(true);
    });

    it('should reject empty required fields', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });
  });

  describe('Length Validation', () => {
    it('should validate correct lengths', () => {
      expect(validateLength('test', { min: 2, max: 10 })).toBe(true);
      expect(validateLength('test', { min: 4, max: 4 })).toBe(true);
    });

    it('should reject incorrect lengths', () => {
      expect(validateLength('t', { min: 2, max: 10 })).toBe(false);
      expect(validateLength('too long string', { min: 2, max: 10 })).toBe(false);
    });
  });

  describe('Numeric Validation', () => {
    it('should validate numeric values', () => {
      expect(validateNumeric('123')).toBe(true);
      expect(validateNumeric('0')).toBe(true);
    });

    it('should reject non-numeric values', () => {
      expect(validateNumeric('abc')).toBe(false);
      expect(validateNumeric('12a')).toBe(false);
      expect(validateNumeric('')).toBe(false);
    });
  });

  describe('Alphabetic Validation', () => {
    it('should validate alphabetic values', () => {
      expect(validateAlphabetic('abc')).toBe(true);
      expect(validateAlphabetic('ABC')).toBe(true);
    });

    it('should reject non-alphabetic values', () => {
      expect(validateAlphabetic('123')).toBe(false);
      expect(validateAlphabetic('abc123')).toBe(false);
      expect(validateAlphabetic('')).toBe(false);
    });
  });

  describe('Alphanumeric Validation', () => {
    it('should validate alphanumeric values', () => {
      expect(validateAlphanumeric('abc123')).toBe(true);
      expect(validateAlphanumeric('ABC123')).toBe(true);
    });

    it('should reject non-alphanumeric values', () => {
      expect(validateAlphanumeric('abc-123')).toBe(false);
      expect(validateAlphanumeric('')).toBe(false);
    });
  });

  describe('URL Validation', () => {
    it('should validate correct URLs', () => {
      expect(validateURL('https://example.com')).toBe(true);
      expect(validateURL('http://sub.example.com/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateURL('not-a-url')).toBe(false);
      expect(validateURL('http://')).toBe(false);
      expect(validateURL('')).toBe(false);
    });
  });

  describe('Date Validation', () => {
    it('should validate correct dates', () => {
      expect(validateDate('2024-03-15')).toBe(true);
      expect(validateDate('15/03/2024')).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(validateDate('invalid-date')).toBe(false);
      expect(validateDate('2024-13-45')).toBe(false);
      expect(validateDate('')).toBe(false);
    });
  });

  describe('Time Validation', () => {
    it('should validate correct times', () => {
      expect(validateTime('10:30')).toBe(true);
      expect(validateTime('23:59')).toBe(true);
    });

    it('should reject invalid times', () => {
      expect(validateTime('25:00')).toBe(false);
      expect(validateTime('10:60')).toBe(false);
      expect(validateTime('')).toBe(false);
    });
  });

  describe('DateTime Validation', () => {
    it('should validate correct date times', () => {
      expect(validateDateTime('2024-03-15T10:30')).toBe(true);
      expect(validateDateTime('15/03/2024 10:30')).toBe(true);
    });

    it('should reject invalid date times', () => {
      expect(validateDateTime('invalid-datetime')).toBe(false);
      expect(validateDateTime('2024-13-45T25:60')).toBe(false);
      expect(validateDateTime('')).toBe(false);
    });
  });

  describe('File Validation', () => {
    it('should validate file size', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      expect(validateFileSize(file, 5 * 1024 * 1024)).toBe(true); // 5MB
    });

    it('should validate file type', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      expect(validateFileType(file, ['image/jpeg', 'image/png'])).toBe(true);
    });

    it('should reject invalid file size', () => {
      const file = new File(['test'.repeat(1024 * 1024)], 'test.jpg', { type: 'image/jpeg' });
      expect(validateFileSize(file, 1024)).toBe(false); // 1KB
    });

    it('should reject invalid file type', () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      expect(validateFileType(file, ['image/jpeg', 'image/png'])).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should validate complete form', () => {
      const formData = {
        email: 'test@example.com',
        password: 'Password123!',
        phone: '+254712345678',
        name: 'Test User'
      };

      const rules = {
        email: { required: true, email: true },
        password: { required: true, password: true },
        phone: { required: true, phone: true },
        name: { required: true, minLength: 2 }
      };

      expect(validateForm(formData, rules)).toEqual({});
    });

    it('should return validation errors', () => {
      const formData = {
        email: 'invalid-email',
        password: 'short',
        phone: 'invalid',
        name: ''
      };

      const rules = {
        email: { required: true, email: true },
        password: { required: true, password: true },
        phone: { required: true, phone: true },
        name: { required: true, minLength: 2 }
      };

      const errors = validateForm(formData, rules);
      expect(errors).toHaveProperty('email');
      expect(errors).toHaveProperty('password');
      expect(errors).toHaveProperty('phone');
      expect(errors).toHaveProperty('name');
    });
  });
}); 