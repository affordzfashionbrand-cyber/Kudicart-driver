export const VEHICLE_TYPES = ['Bike', 'Scooty', 'EV Bike', 'EV Scooty'];

export const isValidRCPrefix = (raw: string): boolean => {
  if (!raw) return true;

  // 1. BH Series (starts with digit): e.g. 22 BH 1234 AA
  if (/^[0-9]/.test(raw)) {
    if (/^[0-9]{1,2}$/.test(raw)) return true;
    if (/^[0-9]{2}B$/.test(raw)) return true;
    if (/^[0-9]{2}BH$/.test(raw)) return true;
    if (/^[0-9]{2}BH[0-9]{1,4}$/.test(raw)) return true;
    if (/^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/.test(raw)) return true;
    return false;
  }

  // 2. Standard Indian State Format: e.g. MH 01 AB 1234 or DL 2 C 1234
  if (/^[A-Z]{1,2}$/.test(raw)) return true;
  if (/^[A-Z]{2}[0-9]{1,2}$/.test(raw)) return true;
  if (/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}$/.test(raw)) return true;
  if (/^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{1,4}$/.test(raw)) return true;

  return false;
};

export const formatRC = (val: string): string => {
  let cleaned = val.toUpperCase().replace(/[^A-Z0-9\- ]/g, '');
  if (!cleaned) return '';

  const sep = cleaned.includes('-') ? '-' : ' ';
  const raw = cleaned.replace(/[\s\-]/g, '');
  if (!raw) return '';

  // 1. BH Series (starts with 2 digits, e.g. 22 BH 1234 AA)
  if (/^[0-9]{1,2}/.test(raw)) {
    const year = raw.slice(0, 2);
    const afterYear = raw.slice(2);
    const bh = afterYear.slice(0, 2);
    const afterBh = afterYear.slice(2);
    const num = afterBh.slice(0, 4);
    const series = afterBh.slice(4, 6);

    let res = year;
    if (bh) res += sep + bh;
    if (num) res += sep + num;
    if (series) res += sep + series;
    return res;
  }

  // 2. Standard Indian State Format: AA 00 AA 0000 (e.g. MH 01 AB 1234)
  const stateMatch = raw.match(/^([A-Z]{0,2})/);
  const state = stateMatch ? stateMatch[1] : '';

  const rem1 = raw.slice(state.length);
  const rtoMatch = rem1.match(/^([0-9]{0,2})/);
  const rto = rtoMatch ? rtoMatch[1] : '';

  const rem2 = rem1.slice(rto.length);
  const seriesMatch = rem2.match(/^([A-Z]{0,3})/);
  const series = seriesMatch ? seriesMatch[1] : '';

  const rem3 = rem2.slice(series.length);
  const numMatch = rem3.match(/^([0-9]{0,4})/);
  const num = numMatch ? numMatch[1] : '';

  let res = state;
  if (rto) res += sep + rto;
  if (series) res += sep + series;
  if (num) res += sep + num;
  return res;
};

// Validation according to Indian registration plate standards (AA 00 AA 0000 / BH Series)
export const validateRegistrationNumber = (val: string): boolean => {
  const trimmed = val.trim().toUpperCase();
  if (!trimmed) return false;
  const clean = trimmed.replace(/[\s\-]/g, '');

  // BH series: 2 digits + BH + 4 digits + 1-2 letters (e.g. 22 BH 1234 AA)
  const bhPattern = /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/;
  if (bhPattern.test(clean)) return true;

  // Standard Indian state registration
  const standardPattern = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{1,4}$/;
  if (standardPattern.test(clean) && clean.length >= 6) return true;

  return false;
};

export const getVehicleFieldError = (field: string, value: string): string => {
  switch (field) {
    case 'registrationNumber':
      if (!value.trim()) return 'Registration number is required';
      if (!validateRegistrationNumber(value)) {
        return 'Enter a valid registration number (e.g. MH 01 AB 1234 or 22 BH 1234 AA)';
      }
      return '';
    case 'vehicleType':
      if (!value) return 'Please select a vehicle type';
      return '';
    case 'make':
      if (!value.trim()) return 'Vehicle make is required';
      if (value.trim().length < 2) return 'Make is too short';
      return '';
    case 'model':
      if (!value.trim()) return 'Vehicle model is required';
      if (value.trim().length < 2) return 'Model is too short';
      return '';
    default:
      return '';
  }
};
