import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useDriverStore } from '../../store/useDriverStore';
import logo from '../../assets/logo.png';
import { KudiIcon } from '../../components/KudiIcon';

export const DriverDetailsScreen = ({ navigation }: any) => {
  const { profile, updateProfile } = useDriverStore();

  const [fullName, setFullName] = useState(profile.fullName || '');
  const [aadhaarNumber, setAadhaarNumber] = useState(profile.aadhaarNumber || '');
  const [panNumber, setPanNumber] = useState(profile.panNumber || '');
  const [dob, setDob] = useState(profile.dob || '');
  const [licenseNumber, setLicenseNumber] = useState(profile.licenseNumber || '');
  const [workPreference, setWorkPreference] = useState(profile.workPreference || '');

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);

  const shouldShowError = (field: string) => {
    return (hasSubmitted || !!touchedFields[field]) && !!errors[field];
  };

  const getAadhaarDisplayValue = () => {
    if (focusedField === 'aadhaar' || showAadhaar) {
      return aadhaarNumber;
    }
    const clean = aadhaarNumber.replace(/\s/g, '');
    if (clean.length === 12) {
      return `•••• •••• ${clean.slice(8, 12)}`;
    }
    return aadhaarNumber;
  };

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
      case 'workPreference':
        if (!value) return 'Please select a work preference';
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (field: string, value: string) => {
    setFocusedField(null);
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    const error = getFieldError(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validate = () => {
    const newErrors = {
      fullName: getFieldError('fullName', fullName),
      aadhaarNumber: getFieldError('aadhaarNumber', aadhaarNumber),
      licenseNumber: getFieldError('licenseNumber', licenseNumber),
      dob: getFieldError('dob', dob),
      panNumber: getFieldError('panNumber', panNumber),
      workPreference: getFieldError('workPreference', workPreference),
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
    setHasSubmitted(true);
    if (validate()) {
      updateProfile({ fullName, aadhaarNumber, panNumber, dob, licenseNumber, workPreference: workPreference as any });
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
            <Text style={styles.stepText}>Partner KYC · Step 1 of 3</Text>

            <Text style={styles.title}>Driver Details</Text>
            <Text style={styles.subtitle}>
              Please provide your identity information. This must exactly match your official documents.
            </Text>

            <Text style={styles.inputLabel}>Full Name <Text style={styles.required}>*</Text></Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'name' && styles.inputFocused,
              shouldShowError('fullName') ? styles.inputError : null
            ]}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Babajide Samuel Adeleke"
                placeholderTextColor={colors.textMuted}
                value={fullName}
                autoCorrect={false}
                onChangeText={(text) => {
                  const formatted = text.replace(/[^A-Za-z\s\-']/g, '');
                  setFullName(formatted);
                  if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                }}
                onFocus={() => setFocusedField('name')}
                onBlur={() => handleBlur('fullName', fullName)}
              />
            </View>
            {shouldShowError('fullName') ? <Text style={styles.validationError}>{errors.fullName}</Text> : null}

            <Text style={[styles.inputLabel, styles.fieldMargin]}>Aadhaar Number <Text style={styles.required}>*</Text></Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'aadhaar' && styles.inputFocused,
              shouldShowError('aadhaarNumber') ? styles.inputError : null
            ]}>
              <TextInput
                style={styles.input}
                placeholder="XXXX XXXX XXXX"
                placeholderTextColor={colors.textMuted}
                value={getAadhaarDisplayValue()}
                keyboardType="number-pad"
                maxLength={14}
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
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
              {aadhaarNumber.replace(/\s/g, '').length === 12 && (
                <TouchableOpacity
                  style={styles.eyeToggle}
                  onPress={() => setShowAadhaar(!showAadhaar)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <KudiIcon
                    name={showAadhaar ? 'eye-off' : 'eye'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
            {shouldShowError('aadhaarNumber') ? <Text style={styles.validationError}>{errors.aadhaarNumber}</Text> : null}

            <Text style={[styles.inputLabel, styles.fieldMargin]}>Licence No. <Text style={styles.required}>*</Text></Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'licence' && styles.inputFocused,
              shouldShowError('licenseNumber') ? styles.inputError : null
            ]}>
              <TextInput
                style={[styles.input, { textTransform: 'uppercase' }]}
                placeholder="TN-1420230000001"
                placeholderTextColor={colors.textMuted}
                value={licenseNumber}
                autoCapitalize="characters"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
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
            {shouldShowError('licenseNumber') ? <Text style={styles.validationError}>{errors.licenseNumber}</Text> : null}

            <View style={styles.rowInputs}>
              <View style={styles.flexHalf}>
                <Text style={styles.inputLabel}>Date of Birth <Text style={styles.required}>*</Text></Text>
                <View style={[
                  styles.inputContainer,
                  focusedField === 'dob' && styles.inputFocused,
                  shouldShowError('dob') ? styles.inputError : null
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={colors.textMuted}
                    value={dob}
                    keyboardType="number-pad"
                    maxLength={10}
                    autoCorrect={false}
                    autoComplete="off"
                    textContentType="none"
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
                {shouldShowError('dob') ? <Text style={styles.validationError}>{errors.dob}</Text> : null}
              </View>

              <View style={styles.spacer} />

              <View style={styles.flexHalf}>
                <Text style={styles.inputLabel}>PAN Number <Text style={styles.required}>*</Text></Text>
                <View style={[
                  styles.inputContainer,
                  focusedField === 'pan' && styles.inputFocused,
                  shouldShowError('panNumber') ? styles.inputError : null
                ]}>
                  <TextInput
                    style={[styles.input, { textTransform: 'uppercase' }]}
                    placeholder="ABCDE1234F"
                    placeholderTextColor={colors.textMuted}
                    value={panNumber}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    autoComplete="off"
                    textContentType="none"
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
                {shouldShowError('panNumber') ? <Text style={styles.validationError}>{errors.panNumber}</Text> : null}
              </View>
            </View>

            {/* Work Preference */}
            <Text style={[styles.inputLabel, styles.sectionMargin]}>Work Preference <Text style={styles.required}>*</Text></Text>
            <Text style={styles.sectionDescription}>How would you like to work?</Text>

            <View style={styles.preferenceRow}>
              <TouchableOpacity 
                style={[
                  styles.radioCard,
                  workPreference === 'FULL_TIME' ? styles.radioCardSelected : styles.radioCardUnselected,
                ]}
                onPress={() => {
                  setWorkPreference('FULL_TIME');
                  setTouchedFields(prev => ({ ...prev, workPreference: true }));
                  if (errors.workPreference) setErrors(prev => ({ ...prev, workPreference: '' }));
                }}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.radioCircle,
                  workPreference === 'FULL_TIME' ? styles.radioCircleSelected : styles.radioCircleUnselected,
                ]}>
                  {workPreference === 'FULL_TIME' && <View style={styles.radioInnerDot} />}
                </View>
                <Text style={styles.radioLabel}>Full-time</Text>
              </TouchableOpacity>

              <View style={styles.spacer} />

              <TouchableOpacity 
                style={[
                  styles.radioCard,
                  workPreference === 'PART_TIME' ? styles.radioCardSelected : styles.radioCardUnselected,
                ]}
                onPress={() => {
                  setWorkPreference('PART_TIME');
                  setTouchedFields(prev => ({ ...prev, workPreference: true }));
                  if (errors.workPreference) setErrors(prev => ({ ...prev, workPreference: '' }));
                }}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.radioCircle,
                  workPreference === 'PART_TIME' ? styles.radioCircleSelected : styles.radioCircleUnselected,
                ]}>
                  {workPreference === 'PART_TIME' && <View style={styles.radioInnerDot} />}
                </View>
                <Text style={styles.radioLabel}>Part-time</Text>
              </TouchableOpacity>
            </View>
            {shouldShowError('workPreference') ? <Text style={styles.validationError}>{errors.workPreference}</Text> : null}
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
  scrollContainer: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: 8,
  },

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
    marginTop: spacing.xs,
  },
  stepText: {
    ...typography.caption,
    letterSpacing: 0.5,
    marginBottom: 6,
    color: colors.primary,
    fontWeight: '700',
  },
  title: {
    ...typography.h1,
    fontWeight: '700',
    color: '#1A2C5B',
    marginBottom: 6,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: 24,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  fieldMargin: {
    marginTop: 22,
  },
  sectionMargin: {
    marginTop: 28,
  },
  required: { color: colors.danger },

  inputContainer: {
    flexDirection: 'row',
    height: 48,
    borderWidth: 1,
    borderColor: colors.inputBorder,
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
    height: 48,
    paddingVertical: 0,
    paddingHorizontal: spacing.m,
    ...typography.bodyLarge,
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    // @ts-ignore
    outlineStyle: 'none',
  },
  eyeToggle: {
    paddingRight: spacing.m,
    paddingLeft: spacing.s,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validationError: {
    ...typography.caption,
    fontSize: 12,
    color: colors.danger,
    marginTop: 5,
  },

  rowInputs: {
    flexDirection: 'row',
    marginTop: 22,
    alignItems: 'flex-start',
  },
  flexHalf: { flex: 1 },
  spacer: { width: spacing.m },

  sectionDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    marginTop: 0,
  },
  radioCard: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
  },
  radioCardSelected: {
    backgroundColor: '#FFF0E8',
    borderColor: '#FF5A1F',
    borderWidth: 1.5,
  },
  radioCardUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2DED7',
    borderWidth: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioCircleSelected: {
    borderColor: '#FF5A1F',
  },
  radioCircleUnselected: {
    borderColor: '#8A8781',
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5A1F',
  },
  radioLabel: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: '#171716',
  },

  footer: {
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 0,
  },
});
