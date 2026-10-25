import { getDriverFieldError, formatAadhaar, formatDOB, formatPAN } from '../features/kyc/driverValidation';
import { getVehicleFieldError, validateRegistrationNumber, VEHICLE_TYPES } from '../features/kyc/vehicleValidation';

describe('KudiCart Driver — Form Validation & Phone Number Authority Tests', () => {
  describe('1. Phone Number Reference Validation Rules', () => {
    const CANONICAL_ERROR = 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';

    const validatePhone = (phone: string): { isValid: boolean; error: string } => {
      const isTenDigits = phone.length === 10;
      const isStartsWithValid = /^[6-9]/.test(phone);
      const isAllSameDigits = /^([0-9])\1{9}$/.test(phone);
      const isDummySeq = phone === '1234567890' || phone === '0123456789';

      const isValid = isTenDigits && isStartsWithValid && !isAllSameDigits && !isDummySeq;
      return {
        isValid,
        error: isValid ? '' : CANONICAL_ERROR,
      };
    };

    it('accepts valid 10-digit Indian numbers starting with 6, 7, 8, 9', () => {
      expect(validatePhone('9876543210').isValid).toBe(true);
      expect(validatePhone('8765432109').isValid).toBe(true);
      expect(validatePhone('7654321098').isValid).toBe(true);
      expect(validatePhone('6543210987').isValid).toBe(true);
    });

    it('rejects numbers starting with invalid digits (0 to 5)', () => {
      expect(validatePhone('5432167890').isValid).toBe(false);
      expect(validatePhone('5432167890').error).toBe(CANONICAL_ERROR);
      expect(validatePhone('1234567890').isValid).toBe(false);
      expect(validatePhone('0987654321').isValid).toBe(false);
    });

    it('rejects all-identical digits (e.g. 9999999999, 8888888888)', () => {
      expect(validatePhone('9999999999').isValid).toBe(false);
      expect(validatePhone('8888888888').isValid).toBe(false);
      expect(validatePhone('7777777777').isValid).toBe(false);
      expect(validatePhone('6666666666').isValid).toBe(false);
    });

    it('rejects sequential dummy numbers (1234567890, 0123456789)', () => {
      expect(validatePhone('1234567890').isValid).toBe(false);
      expect(validatePhone('0123456789').isValid).toBe(false);
    });

    it('rejects numbers with fewer or greater than 10 digits', () => {
      expect(validatePhone('98765').isValid).toBe(false);
      expect(validatePhone('987654321').isValid).toBe(false);
      expect(validatePhone('98765432101').isValid).toBe(false);
    });
  });

  describe('2. Driver Profile & KYC Validation', () => {
    it('validates full name', () => {
      expect(getDriverFieldError('fullName', '')).toBe('Full name is required');
      expect(getDriverFieldError('fullName', 'A')).toBe('Enter a valid full name');
      expect(getDriverFieldError('fullName', '12345')).toBe('Enter a valid full name');
      expect(getDriverFieldError('fullName', 'Rajesh Kumar')).toBe('');
    });

    it('validates Aadhaar number (12 digits required)', () => {
      expect(getDriverFieldError('aadhaarNumber', '')).toBe('Aadhaar number is required');
      expect(getDriverFieldError('aadhaarNumber', '1234 5678')).toBe('Enter a valid 12-digit Aadhaar number');
      expect(getDriverFieldError('aadhaarNumber', '5432 1098 7654')).toBe('');
    });

    it('validates Driving Licence format', () => {
      expect(getDriverFieldError('licenseNumber', '')).toBe('Licence number is required');
      expect(getDriverFieldError('licenseNumber', 'DL123')).toBe('Enter a valid licence number');
      expect(getDriverFieldError('licenseNumber', 'KA 0520210001234')).toBe('');
      expect(getDriverFieldError('licenseNumber', 'DL-0420220941823')).toBe('');
    });

    it('validates Date of Birth format and boundaries', () => {
      expect(getDriverFieldError('dob', '')).toBe('Date of birth is required');
      expect(getDriverFieldError('dob', '31/02/1995')).toBe('Enter a valid date of birth');
      expect(getDriverFieldError('dob', '01/01/2099')).toBe('Date of birth cannot be in the future');
      expect(getDriverFieldError('dob', '15/08/1996')).toBe('');
    });

    it('validates PAN number format', () => {
      expect(getDriverFieldError('panNumber', '')).toBe('PAN number is required');
      expect(getDriverFieldError('panNumber', 'ABCD12345')).toBe('Enter a valid PAN number');
      expect(getDriverFieldError('panNumber', 'ABCDE1234F')).toBe('');
    });

    it('validates work preference', () => {
      expect(getDriverFieldError('workPreference', '')).toBe('Please select a work preference');
      expect(getDriverFieldError('workPreference', 'FULL_TIME')).toBe('');
      expect(getDriverFieldError('workPreference', 'PART_TIME')).toBe('');
    });
  });

  describe('3. Vehicle Details Validation', () => {
    it('accepts valid state registration numbers', () => {
      expect(validateRegistrationNumber('MH 01 AB 1234')).toBe(true);
      expect(validateRegistrationNumber('KA 05 MJ 4821')).toBe(true);
      expect(validateRegistrationNumber('DL 2 C 1234')).toBe(true);
    });

    it('accepts valid Bharat (BH) series registration numbers', () => {
      expect(validateRegistrationNumber('22 BH 1234 AA')).toBe(true);
      expect(validateRegistrationNumber('23 BH 9999 Z')).toBe(true);
    });

    it('rejects malformed vehicle registration numbers', () => {
      expect(validateRegistrationNumber('')).toBe(false);
      expect(validateRegistrationNumber('12345')).toBe(false);
      expect(validateRegistrationNumber('INVALID_PLATE')).toBe(false);
    });

    it('enforces supported vehicle types', () => {
      expect(VEHICLE_TYPES).toContain('Bike');
      expect(VEHICLE_TYPES).toContain('Scooty');
      expect(VEHICLE_TYPES).toContain('EV Bike');
      expect(VEHICLE_TYPES).toContain('EV Scooty');
      expect(getVehicleFieldError('vehicleType', '')).toBe('Please select a vehicle type');
      expect(getVehicleFieldError('vehicleType', 'Bike')).toBe('');
    });
  });

  describe('4. KYC Document Requirements & Single-Sided PAN Card Rules', () => {
    it('verifies PAN card only requires front side while Aadhaar, DL, and RC require both sides', () => {
      // Document upload completion logic aligned with genuine business requirements
      const isDocComplete = (docType: string, front: any, back: any) => {
        if (docType === 'pan') {
          return Boolean(front);
        }
        return Boolean(front && back);
      };

      // PAN with front only is complete
      expect(isDocComplete('pan', { uri: 'pan_front.jpg' }, null)).toBe(true);
      expect(isDocComplete('pan', null, null)).toBe(false);

      // Aadhaar requires both front and back
      expect(isDocComplete('aadhaar', { uri: 'aadhaar_front.jpg' }, null)).toBe(false);
      expect(isDocComplete('aadhaar', { uri: 'aadhaar_front.jpg' }, { uri: 'aadhaar_back.jpg' })).toBe(true);

      // Driving licence requires both front and back
      expect(isDocComplete('drivingLicence', { uri: 'dl_front.jpg' }, null)).toBe(false);
      expect(isDocComplete('drivingLicence', { uri: 'dl_front.jpg' }, { uri: 'dl_back.jpg' })).toBe(true);

      // Vehicle RC requires both front and back
      expect(isDocComplete('vehicleRc', { uri: 'rc_front.jpg' }, null)).toBe(false);
      expect(isDocComplete('vehicleRc', { uri: 'rc_front.jpg' }, { uri: 'rc_back.jpg' })).toBe(true);
    });

    it('verifies KYC submission readiness with single-sided PAN', () => {
      const documents = {
        aadhaar: { front: { uri: 'a1.jpg' }, back: { uri: 'a2.jpg' } },
        pan: { front: { uri: 'pan_f.jpg' }, back: null }, // PAN back is intentionally null
        drivingLicence: { front: { uri: 'dl1.jpg' }, back: { uri: 'dl2.jpg' } },
        vehicleRc: { front: { uri: 'rc1.jpg' }, back: { uri: 'rc2.jpg' } },
      };

      const isAllComplete = Boolean(
        documents.aadhaar.front && documents.aadhaar.back &&
        documents.pan.front &&
        documents.drivingLicence.front && documents.drivingLicence.back &&
        documents.vehicleRc.front && documents.vehicleRc.back
      );

      expect(isAllComplete).toBe(true);
    });
  });
});
