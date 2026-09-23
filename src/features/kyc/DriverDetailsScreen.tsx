import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useDriverStore } from '../../store/useDriverStore';
import logo from '../../assets/logo.png';

const Icon = ({ name, color, size = 20 }: { name: string; color: string; size?: number }) => {
  const getIcon = () => {
    switch (name) {
      case 'arrow-left': return '←';
      case 'calendar': return '📅';
      default: return '•';
    }
  };
  return (
    <Text style={{ fontSize: size, color: color, textAlign: 'center', lineHeight: size * 1.2 }}>
      {getIcon()}
    </Text>
  );
};

export const DriverDetailsScreen = ({ navigation }: any) => {
  const { profile, updateProfile } = useDriverStore();

  const [fullName, setFullName] = useState(profile.fullName || '');
  const [aadhaarNumber, setAadhaarNumber] = useState(profile.aadhaarNumber || '');
  const [panNumber, setPanNumber] = useState(profile.panNumber || '');
  const [dob, setDob] = useState(profile.dob || '');
  const [licenseNumber, setLicenseNumber] = useState(profile.licenseNumber || '');

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const formatAadhaar = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 12);
    return digits.match(/.{1,4}/g)?.join(' ') || digits;
  };

  const formatDL = (val: string, prevVal: string) => {
    let cleaned = val.toUpperCase().replace(/[^A-Z0-9\- ]/g, '');
    let match = cleaned.match(/^([A-Z]{0,2})([ \-]?)(.*)/);
    if (!match) return cleaned;
    let letters = match[1];
    let separator = match[2];
    let numbers = match[3].replace(/[^0-9]/g, '').substring(0, 13);
    if (letters.length === 2 && !separator && match[3].length > 0 && /[0-9]/.test(match[3][0])) separator = ' ';
    if (letters.length < 2 && prevVal.length < 2) { separator = ''; numbers = ''; }
    return letters + separator + numbers;
  };

  const formatDOB = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 8);
    if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const formatPAN = (val: string, prevVal: string) => {
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

  const getFieldError = (field: string, value: string): string => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (!/^[A-Za-z\s\-']+$/.test(value.trim()) || value.trim().length < 2) return 'Enter a valid full name';
        return '';
      case 'aadhaarNumber':
        const normalizedAadhaar = value.replace(/\s/g, '');
        if (!normalizedAadhaar) return 'Aadhaar number is required';
        if (!/^\d{12}$/.test(normalizedAadhaar)) return 'Enter a valid 12-digit Aadhaar number';
        return '';
      case 'licenseNumber':
        if (!value.trim()) return 'Licence number is required';
        if (!/^[A-Z]{2}[-\s][0-9]{13}$/.test(value.trim())) return 'Enter a valid licence number';
        return '';
      case 'dob':
        if (!value.trim()) return 'Date of birth is required';
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value.trim())) return 'Enter a valid date of birth';
        const [d, m, y] = value.trim().split('/').map(Number);
        const date = new Date(y, m - 1, d);
        if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return 'Enter a valid date of birth';
        if (date > new Date()) return 'Date of birth cannot be in the future';
        return '';
      case 'panNumber':
        if (!value.trim()) return 'PAN number is required';
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.toUpperCase().trim())) return 'Enter a valid PAN number';
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (field: string, value: string) => {
    setFocusedField(null);
    const error = getFieldError(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validate = () => {
    const newErrors = {
      fullName: getFieldError('fullName', fullName),
      aadhaarNumber: getFieldError('aadhaarNumber', aadhaarNumber),
      licenseNumber: getFieldError('licenseNumber', licenseNumber),
      dob: getFieldError('dob', dob),
      panNumber: getFieldError('panNumber', panNumber),
    };

    const activeErrors: { [key: string]: string } = {};
    let isValid = true;
    for (const [key, val] of Object.entries(newErrors)) {
      if (val) {
        activeErrors[key] = val;
        isValid = false;
      }
    }

    setErrors(activeErrors);
    return isValid;
  };

  const handleContinue = () => {
    if (validate()) {
      updateProfile({ fullName, aadhaarNumber, panNumber, dob, licenseNumber });
      navigation.navigate('VehicleDetails');
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header matched to Login Screen */}
          <View style={styles.header}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={styles.content}>
            <Text style={styles.stepText}>PARTNER KYC • STEP 1 OF 4</Text>

            <Text style={styles.title}>Driver Details</Text>
            <Text style={styles.subtitle}>
              Please provide your identity information. This must exactly match your official documents.
            </Text>

            <Text style={styles.inputLabel}>Full Name <Text style={styles.required}>*</Text></Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'name' && styles.inputFocused,
              errors.fullName ? styles.inputError : null
            ]}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Babajide Samuel Adeleke"
                placeholderTextColor={colors.textMuted}
                value={fullName}
                onChangeText={(text) => {
                  const formatted = text.replace(/[^A-Za-z\s\-']/g, '');
                  setFullName(formatted);
                  if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                }}
                onFocus={() => setFocusedField('name')}
                onBlur={() => handleBlur('fullName', fullName)}
              />
            </View>
            {errors.fullName ? <Text style={styles.validationError}>{errors.fullName}</Text> : null}

            <Text style={[styles.inputLabel, { marginTop: spacing.xl }]}>Aadhaar Number <Text style={styles.required}>*</Text></Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'aadhaar' && styles.inputFocused,
              errors.aadhaarNumber ? styles.inputError : null
            ]}>
              <TextInput
                style={styles.input}
                placeholder="XXXX XXXX XXXX"
                placeholderTextColor={colors.textMuted}
                value={aadhaarNumber}
                keyboardType="number-pad"
                maxLength={14}
                onChangeText={(text) => {
                  if (errors.aadhaarNumber) setErrors(prev => ({ ...prev, aadhaarNumber: '' }));
                  if (text.length > aadhaarNumber.length) {
                    let i = 0;
                    while (i < aadhaarNumber.length && text[i] === aadhaarNumber[i]) i++;
                    if (text[i] && !/[0-9\s]/.test(text[i])) {
                      setAadhaarNumber(aadhaarNumber);
                      return;
                    }
                  }
                  const isMiddleEdit = !text.startsWith(aadhaarNumber) && !aadhaarNumber.startsWith(text) && text !== '';
                  if (isMiddleEdit) setAadhaarNumber(text);
                  else setAadhaarNumber(formatAadhaar(text));
                }}
                onFocus={() => setFocusedField('aadhaar')}
                onBlur={() => {
                  const formatted = formatAadhaar(aadhaarNumber);
                  setAadhaarNumber(formatted);
                  handleBlur('aadhaarNumber', formatted);
                }}
              />
            </View>
            {errors.aadhaarNumber ? <Text style={styles.validationError}>{errors.aadhaarNumber}</Text> : null}

            <Text style={[styles.inputLabel, { marginTop: spacing.xl }]}>Licence No. <Text style={styles.required}>*</Text></Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'licence' && styles.inputFocused,
              errors.licenseNumber ? styles.inputError : null
            ]}>
              <TextInput
                style={[styles.input, { textTransform: 'uppercase' }]}
                placeholder="TN-1420230000001"
                placeholderTextColor={colors.textMuted}
                value={licenseNumber}
                autoCapitalize="characters"
                maxLength={16}
                onChangeText={(text) => { 
                  if (errors.licenseNumber) setErrors(prev => ({ ...prev, licenseNumber: '' }));
                  if (text.length > licenseNumber.length) {
                    let i = 0;
                    while (i < licenseNumber.length && text[i] === licenseNumber[i]) i++;
                    let inserted = text[i];
                    if (inserted) {
                      let isValid = true;
                      if (i < 2 && !/[A-Z]/i.test(inserted)) isValid = false;
                      if (i === 2 && !/[0-9-\s]/.test(inserted)) isValid = false;
                      if (i > 2 && !/[0-9]/.test(inserted)) isValid = false;
                      if (!isValid) {
                        setLicenseNumber(licenseNumber);
                        return;
                      }
                    }
                  }
                  const isMiddleEdit = !text.startsWith(licenseNumber) && !licenseNumber.startsWith(text) && text !== '';
                  if (isMiddleEdit) setLicenseNumber(text);
                  else setLicenseNumber(formatDL(text, licenseNumber));
                }}
                onFocus={() => setFocusedField('licence')}
                onBlur={() => {
                  const formatted = formatDL(licenseNumber, licenseNumber);
                  setLicenseNumber(formatted);
                  handleBlur('licenseNumber', formatted);
                }}
              />
            </View>
            {errors.licenseNumber ? <Text style={styles.validationError}>{errors.licenseNumber}</Text> : null}

            <View style={styles.rowInputs}>
              <View style={styles.flexHalf}>
                <Text style={styles.inputLabel}>Date of Birth <Text style={styles.required}>*</Text></Text>
                <View style={[
                  styles.inputContainer,
                  focusedField === 'dob' && styles.inputFocused,
                  errors.dob ? styles.inputError : null
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={colors.textMuted}
                    value={dob}
                    keyboardType="number-pad"
                    maxLength={10}
                    onChangeText={(text) => {
                      if (errors.dob) setErrors(prev => ({ ...prev, dob: '' }));
                      if (text.length > dob.length) {
                        let i = 0;
                        while (i < dob.length && text[i] === dob[i]) i++;
                        if (text[i] && !/[0-9\/]/.test(text[i])) {
                          setDob(dob);
                          return;
                        }
                      }
                      const isMiddleEdit = !text.startsWith(dob) && !dob.startsWith(text) && text !== '';
                      if (isMiddleEdit) setDob(text);
                      else setDob(formatDOB(text));
                    }}
                    onFocus={() => setFocusedField('dob')}
                    onBlur={() => {
                      const formatted = formatDOB(dob);
                      setDob(formatted);
                      handleBlur('dob', formatted);
                    }}
                  />
                </View>
                {errors.dob ? <Text style={styles.validationError}>{errors.dob}</Text> : null}
              </View>

              <View style={styles.spacer} />

              <View style={styles.flexHalf}>
                <Text style={styles.inputLabel}>PAN Number <Text style={styles.required}>*</Text></Text>
                <View style={[
                  styles.inputContainer,
                  focusedField === 'pan' && styles.inputFocused,
                  errors.panNumber ? styles.inputError : null
                ]}>
                  <TextInput
                    style={[styles.input, { textTransform: 'uppercase' }]}
                    placeholder="ABCDE1234F"
                    placeholderTextColor={colors.textMuted}
                    value={panNumber}
                    autoCapitalize="characters"
                    maxLength={10}
                    onChangeText={(text) => {
                      if (errors.panNumber) setErrors(prev => ({ ...prev, panNumber: '' }));
                      if (text.length > panNumber.length) {
                        let i = 0;
                        while (i < panNumber.length && text[i] === panNumber[i]) i++;
                        let inserted = text[i];
                        if (inserted) {
                          let expectedType = i < 5 ? 'L' : (i < 9 ? 'N' : 'L');
                          let isValid = (expectedType === 'L' && /[A-Z]/i.test(inserted)) || (expectedType === 'N' && /[0-9]/.test(inserted));
                          if (!isValid) {
                            setPanNumber(panNumber);
                            return;
                          }
                        }
                      }
                      const isMiddleEdit = !text.startsWith(panNumber) && !panNumber.startsWith(text) && text !== '';
                      if (isMiddleEdit) setPanNumber(text);
                      else setPanNumber(formatPAN(text, panNumber));
                    }}
                    onFocus={() => setFocusedField('pan')}
                    onBlur={() => {
                      const formatted = formatPAN(panNumber, panNumber);
                      setPanNumber(formatted);
                      handleBlur('panNumber', formatted);
                    }}
                  />
                </View>
                {errors.panNumber ? <Text style={styles.validationError}>{errors.panNumber}</Text> : null}
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <PrimaryButton title="Continue" onPress={handleContinue} />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: spacing.l },

  header: {
    alignItems: 'center',
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  logo: {
    width: 140,
    height: 40,
  },

  content: {
    marginTop: spacing.s,
  },
  stepText: {
    ...typography.caption,
    letterSpacing: 1,
    marginBottom: spacing.s,
    color: colors.primary,
    fontWeight: '700',
  },
  title: {
    ...typography.h1,
    fontWeight: '700',
    color: '#1A2C5B',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },

  inputLabel: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.s,
  },
  required: { color: colors.danger },

  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E2E8F0', // Matched to inputBorder from Login
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    ...typography.bodyLarge,
    fontWeight: '400',
    color: colors.text,
    // @ts-ignore
    outlineStyle: 'none',
  },
  validationError: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.s,
  },

  rowInputs: { flexDirection: 'row', marginTop: spacing.xl },
  flexHalf: { flex: 1 },
  spacer: { width: spacing.m },

  footer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
});
