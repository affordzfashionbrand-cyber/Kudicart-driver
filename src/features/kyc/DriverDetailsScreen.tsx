import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { useDriverStore } from '../../store/useDriverStore';
import logo from '../../assets/logo.png';
import { KudiIcon } from '../../components/KudiIcon';
import {
  formatAadhaar,
  formatDL,
  formatDOB,
  formatPAN,
  getDriverFieldError,
} from './driverValidation';
import { styles } from './driverDetails.styles';
import { WorkPreferenceSelector } from './WorkPreferenceSelector';

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

  const handleBlur = (field: string, value: string) => {
    setFocusedField(null);
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    const error = getDriverFieldError(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validate = () => {
    const newErrors = {
      fullName: getDriverFieldError('fullName', fullName),
      aadhaarNumber: getDriverFieldError('aadhaarNumber', aadhaarNumber),
      licenseNumber: getDriverFieldError('licenseNumber', licenseNumber),
      dob: getDriverFieldError('dob', dob),
      panNumber: getDriverFieldError('panNumber', panNumber),
      workPreference: getDriverFieldError('workPreference', workPreference),
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
      updateProfile({
        fullName,
        aadhaarNumber,
        panNumber,
        dob,
        licenseNumber,
        workPreference: workPreference as any,
      });
      navigation.navigate('VehicleDetails');
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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

            <Text style={styles.inputLabel}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.inputContainer,
                focusedField === 'name' && styles.inputFocused,
                shouldShowError('fullName') ? styles.inputError : null,
              ]}
            >
              <TextInput
                style={styles.input}
                placeholder="e.g. Babajide Samuel Adeleke"
                placeholderTextColor={colors.textMuted}
                value={fullName}
                autoCorrect={false}
                onChangeText={(text) => {
                  const formatted = text.replace(/[^A-Za-z\s\-']/g, '');
                  setFullName(formatted);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                }}
                onFocus={() => setFocusedField('name')}
                onBlur={() => handleBlur('fullName', fullName)}
              />
            </View>
            {shouldShowError('fullName') ? (
              <Text style={styles.validationError}>{errors.fullName}</Text>
            ) : null}

            <Text style={[styles.inputLabel, styles.fieldMargin]}>
              Aadhaar Number <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.inputContainer,
                focusedField === 'aadhaar' && styles.inputFocused,
                shouldShowError('aadhaarNumber') ? styles.inputError : null,
              ]}
            >
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
                  if (errors.aadhaarNumber) setErrors((prev) => ({ ...prev, aadhaarNumber: '' }));
                  if (text.length > aadhaarNumber.length) {
                    let i = 0;
                    while (i < aadhaarNumber.length && text[i] === aadhaarNumber[i]) i++;
                    if (text[i] && !/[0-9\s]/.test(text[i])) {
                      setAadhaarNumber(aadhaarNumber);
                      return;
                    }
                  }
                  const isMiddleEdit =
                    !text.startsWith(aadhaarNumber) &&
                    !aadhaarNumber.startsWith(text) &&
                    text !== '';
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
            {shouldShowError('aadhaarNumber') ? (
              <Text style={styles.validationError}>{errors.aadhaarNumber}</Text>
            ) : null}

            <Text style={[styles.inputLabel, styles.fieldMargin]}>
              Licence No. <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.inputContainer,
                focusedField === 'licence' && styles.inputFocused,
                shouldShowError('licenseNumber') ? styles.inputError : null,
              ]}
            >
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
                  if (errors.licenseNumber) setErrors((prev) => ({ ...prev, licenseNumber: '' }));
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
                  const isMiddleEdit =
                    !text.startsWith(licenseNumber) &&
                    !licenseNumber.startsWith(text) &&
                    text !== '';
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
            {shouldShowError('licenseNumber') ? (
              <Text style={styles.validationError}>{errors.licenseNumber}</Text>
            ) : null}

            <View style={styles.rowInputs}>
              <View style={styles.flexHalf}>
                <Text style={styles.inputLabel}>
                  Date of Birth <Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'dob' && styles.inputFocused,
                    shouldShowError('dob') ? styles.inputError : null,
                  ]}
                >
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
                      if (errors.dob) setErrors((prev) => ({ ...prev, dob: '' }));
                      if (text.length > dob.length) {
                        let i = 0;
                        while (i < dob.length && text[i] === dob[i]) i++;
                        if (text[i] && !/[0-9\/]/.test(text[i])) {
                          setDob(dob);
                          return;
                        }
                      }
                      const isMiddleEdit =
                        !text.startsWith(dob) && !dob.startsWith(text) && text !== '';
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
                {shouldShowError('dob') ? (
                  <Text style={styles.validationError}>{errors.dob}</Text>
                ) : null}
              </View>

              <View style={styles.spacer} />

              <View style={styles.flexHalf}>
                <Text style={styles.inputLabel}>
                  PAN Number <Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'pan' && styles.inputFocused,
                    shouldShowError('panNumber') ? styles.inputError : null,
                  ]}
                >
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
                      if (errors.panNumber) setErrors((prev) => ({ ...prev, panNumber: '' }));
                      if (text.length > panNumber.length) {
                        let i = 0;
                        while (i < panNumber.length && text[i] === panNumber[i]) i++;
                        let inserted = text[i];
                        if (inserted) {
                          let expectedType = i < 5 ? 'L' : i < 9 ? 'N' : 'L';
                          let isValid =
                            (expectedType === 'L' && /[A-Z]/i.test(inserted)) ||
                            (expectedType === 'N' && /[0-9]/.test(inserted));
                          if (!isValid) {
                            setPanNumber(panNumber);
                            return;
                          }
                        }
                      }
                      const isMiddleEdit =
                        !text.startsWith(panNumber) &&
                        !panNumber.startsWith(text) &&
                        text !== '';
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
                {shouldShowError('panNumber') ? (
                  <Text style={styles.validationError}>{errors.panNumber}</Text>
                ) : null}
              </View>
            </View>

            <WorkPreferenceSelector
              value={workPreference}
              onChange={(pref) => {
                setWorkPreference(pref);
                setTouchedFields((prev) => ({ ...prev, workPreference: true }));
                if (errors.workPreference) {
                  setErrors((prev) => ({ ...prev, workPreference: '' }));
                }
              }}
              showError={shouldShowError('workPreference')}
              errorMessage={errors.workPreference}
            />
          </View>

          <View style={styles.footer}>
            <PrimaryButton title="Continue" onPress={handleContinue} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};
