export const formatAadhaar = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 12);
  return digits.match(/.{1,4}/g)?.join(' ') || digits;
};

export const formatDL = (val: string, prevVal: string) => {
  let cleaned = val.toUpperCase().replace(/[^A-Z0-9\- ]/g, '');
  let match = cleaned.match(/^([A-Z]{0,2})([ \-]?)(.*)/);
  if (!match) return cleaned;
  let letters = match[1];
  let separator = match[2];
  let numbers = match[3].replace(/[^0-9]/g, '').substring(0, 13);
  if (letters.length === 2 && !separator && match[3].length > 0 && /[0-9]/.test(match[3][0])) separator = ' ';
  if (letters.length < 2 && prevVal.length < 2) {
    separator = '';
    numbers = '';
  }
  return letters + separator + numbers;
};

export const formatDOB = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
};

export const formatPAN = (val: string, prevVal: string) => {
  let cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
  let match = cleaned.match(/^([A-Z]{0,5})([0-9]{0,4})([A-Z]?)/);
  if (!match) return cleaned;

  let pLetters = match[1];
  let pNumbers = match[2];
  let pLast = match[3];

  if (pLetters.length < 5 && pNumbers.length > 0 && prevVal.length < 5) pNumbers = '';
  if ((pLetters.length < 5 || pNumbers.length < 4) && pLast.length > 0 && prevVal.length < 9) pLast = '';

  return pLetters + pNumbers + pLast;
};

export const getDriverFieldError = (field: string, value: string): string => {
  switch (field) {
    case 'fullName':
      if (!value.trim()) return 'Full name is required';
      if (!/^[A-Za-z\s\-']+$/.test(value.trim()) || value.trim().length < 2) return 'Enter a valid full name';
      return '';
    case 'aadhaarNumber': {
      const normalizedAadhaar = value.replace(/\s/g, '');
      if (!normalizedAadhaar) return 'Aadhaar number is required';
      if (!/^\d{12}$/.test(normalizedAadhaar)) return 'Enter a valid 12-digit Aadhaar number';
      return '';
    }
    case 'licenseNumber':
      if (!value.trim()) return 'Licence number is required';
      if (!/^[A-Z]{2}[-\s][0-9]{13}$/.test(value.trim())) return 'Enter a valid licence number';
      return '';
    case 'dob': {
      if (!value.trim()) return 'Date of birth is required';
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())) return 'Enter a valid date of birth';
      const [d, m, y] = value.trim().split('/').map(Number);
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return 'Enter a valid date of birth';
      if (date > new Date()) return 'Date of birth cannot be in the future';
      return '';
    }
    case 'panNumber':
      if (!value.trim()) return 'PAN number is required';
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.toUpperCase().trim())) return 'Enter a valid PAN number';
      return '';
    case 'workPreference':
      if (!value) return 'Please select a work preference';
      return '';
    default:
      return '';
  }
};
