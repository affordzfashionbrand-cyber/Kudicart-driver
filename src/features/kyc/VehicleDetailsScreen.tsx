import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useDriverStore } from '../../store/useDriverStore';
import logo from '../../assets/logo.png';
import { KudiIcon } from '../../components/KudiIcon';

const VEHICLE_TYPES = ['Bike', 'Scooty', 'EV Bike', 'EV Scooty'];

export const VehicleDetailsScreen = ({ navigation }: any) => {
  const { vehicle, updateVehicle } = useDriverStore();

  const [registrationNumber, setRegistrationNumber] = useState(vehicle.registrationNumber || '');
  const [vehicleType, setVehicleType] = useState(vehicle.vehicleType || '');
  const [make, setMake] = useState(vehicle.make || '');
  const [model, setModel] = useState(vehicle.model || '');

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const isValidRCPrefix = (raw: string): boolean => {
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
    // State: 1-2 letters
    if (/^[A-Z]{1,2}$/.test(raw)) return true;
    // State (2 letters) + RTO (1-2 digits)
    if (/^[A-Z]{2}[0-9]{1,2}$/.test(raw)) return true;
    // State (2 letters) + RTO (1-2 digits) + Series (1-3 letters)
    if (/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}$/.test(raw)) return true;
    // State (2 letters) + RTO (1-2 digits) + Series (0-3 letters) + Number (1-4 digits)
    if (/^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{1,4}$/.test(raw)) return true;

    return false;
  };

  const formatRC = (val: string): string => {
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
  const validateRegistrationNumber = (val: string): boolean => {
    const trimmed = val.trim().toUpperCase();
    if (!trimmed) return false;
    const clean = trimmed.replace(/[\s\-]/g, '');

    // BH series: 2 digits + BH + 4 digits + 1-2 letters (e.g. 22 BH 1234 AA)
    const bhPattern = /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/;
    if (bhPattern.test(clean)) return true;

    // Standard Indian state registration: 2 letters (State) + 1-2 digits (RTO) + 0-3 letters (Series) + 1-4 digits (Unique)
    // e.g. MH 01 AB 1234, DL 01 A 1234, TN 01 AB 1234, DL 2 C 1234
    const standardPattern = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{1,4}$/;
    if (standardPattern.test(clean) && clean.length >= 6) return true;

    return false;
  };

  const getFieldError = (field: string, value: string): string => {
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

  const shouldShowError = (field: string) => {
    return (hasSubmitted || !!touchedFields[field]) && !!errors[field];
  };

  const handleBlur = (field: string, value: string) => {
    setFocusedField(null);
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    const error = getFieldError(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const isFormValid = Boolean(
    registrationNumber.trim() &&
    validateRegistrationNumber(registrationNumber) &&
    vehicleType &&
    make.trim().length >= 2 &&
    model.trim().length >= 2
  );

  const validate = () => {
    const newErrors = {
      registrationNumber: getFieldError('registrationNumber', registrationNumber),
      vehicleType: getFieldError('vehicleType', vehicleType),
      make: getFieldError('make', make),
      model: getFieldError('model', model),
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
      updateVehicle({
        registrationNumber: registrationNumber.trim(),
        vehicleType,
        make: make.trim(),
        model: model.trim(),
      });
      navigation.navigate('DocumentUploads');
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Header matched to DriverDetailsScreen and Login Screen */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <KudiIcon name="arrow-left" color={colors.primary} size={24} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            </View>
            <View style={styles.backButtonPlaceholder} />
          </View>

          <View style={styles.content}>
            <Text style={styles.stepText}>Partner KYC · Step 2 of 3</Text>

            <Text style={styles.title}>Vehicle Details</Text>
            <Text style={styles.subtitle}>
              Please provide the details of the vehicle you will use for deliveries.
            </Text>

            {/* Registration Number Field with keystroke filtering */}
            <Text style={styles.inputLabel}>Registration Number <Text style={styles.required}>*</Text></Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'registration' && styles.inputFocused,
              shouldShowError('registrationNumber') ? styles.inputError : null
            ]}>
              <TextInput
                style={[styles.input, { textTransform: 'uppercase' }]}
                placeholder="MH 01 AB 1234"
                placeholderTextColor={colors.textMuted}
                value={registrationNumber}
                autoCapitalize="characters"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                maxLength={14}
                onChangeText={(text) => {
                  if (errors.registrationNumber) {
                    setErrors(prev => ({ ...prev, registrationNumber: '' }));
                  }

                  // Handle deletion
                  if (text.length < registrationNumber.length) {
                    setRegistrationNumber(text);
                    return;
                  }

                  const upper = text.toUpperCase();
                  const raw = upper.replace(/[\s\-]/g, '');

                  // Validate that this raw prefix conforms to standard Indian vehicle format or BH format
                  if (!isValidRCPrefix(raw)) {
                    // Reject invalid keystroke (e.g. typing letters where RTO digits are required)
                    setRegistrationNumber(registrationNumber);
                    return;
                  }

                  const isMiddleEdit = !text.startsWith(registrationNumber) && !registrationNumber.startsWith(text) && text !== '';
                  if (isMiddleEdit) {
                    setRegistrationNumber(upper);
                  } else {
                    let formatted = formatRC(upper);
                    // Preserve explicit trailing space/hyphen if user is deliberately typing separators
                    if ((text.endsWith(' ') || text.endsWith('-')) && !formatted.endsWith(' ') && !formatted.endsWith('-') && raw.length >= 2) {
                      formatted += text.slice(-1);
                    }
                    setRegistrationNumber(formatted);
                  }
                }}
                onFocus={() => {
                  setFocusedField('registration');
                  setIsTypeDropdownOpen(false);
                }}
                onBlur={() => {
                  const formatted = formatRC(registrationNumber);
                  setRegistrationNumber(formatted);
                  handleBlur('registrationNumber', formatted);
                }}
              />
            </View>
            {shouldShowError('registrationNumber') ? <Text style={styles.validationError}>{errors.registrationNumber}</Text> : null}

            {/* Vehicle Type Dropdown with floating popover card */}
            <Text style={[styles.inputLabel, styles.fieldMargin]}>Vehicle Type <Text style={styles.required}>*</Text></Text>
            <View style={[styles.typeDropdownWrapper, isTypeDropdownOpen && { zIndex: 1000 }]}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.inputContainer,
                  styles.dropdownContainer,
                  isTypeDropdownOpen && styles.inputFocused,
                  shouldShowError('vehicleType') ? styles.inputError : null,
                ]}
                onPress={() => {
                  setFocusedField('type');
                  setIsTypeDropdownOpen(!isTypeDropdownOpen);
                }}
              >
                <Text style={[styles.dropdownText, !vehicleType && styles.placeholderText]}>
                  {vehicleType || 'Select Vehicle Type'}
                </Text>
                <KudiIcon
                  name={isTypeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  color={colors.textSecondary}
                  size={14}
                />
              </TouchableOpacity>

              {isTypeDropdownOpen && (
                <>
                  <TouchableOpacity
                    style={styles.dropdownBackdrop}
                    activeOpacity={1}
                    onPress={() => setIsTypeDropdownOpen(false)}
                  />
                  <View style={styles.typeDropdownList}>
                    {VEHICLE_TYPES.map((type, index) => {
                      const isSelected = vehicleType === type;
                      return (
                        <TouchableOpacity
                          key={type}
                          activeOpacity={0.7}
                          style={[
                            styles.typeDropdownItem,
                            isSelected && styles.typeDropdownItemActive,
                            index === VEHICLE_TYPES.length - 1 && { borderBottomWidth: 0 },
                          ]}
                          onPress={() => {
                            setVehicleType(type);
                            setTouchedFields(prev => ({ ...prev, vehicleType: true }));
                            setErrors(prev => ({ ...prev, vehicleType: '' }));
                            setIsTypeDropdownOpen(false);
                            setFocusedField(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.typeDropdownItemText,
                              isSelected && styles.typeDropdownItemTextActive,
                            ]}
                          >
                            {type}
                          </Text>
                          {isSelected && <KudiIcon name="check" color={colors.primary} size={14} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
            {shouldShowError('vehicleType') ? <Text style={styles.validationError}>{errors.vehicleType}</Text> : null}

            {/* Two-column Text Input Fields for Vehicle Make & Vehicle Model */}
            <View style={styles.rowInputs}>
              {/* Vehicle Make (Text Input) */}
              <View style={styles.flexHalf}>
                <Text style={styles.inputLabel}>Vehicle Make <Text style={styles.required}>*</Text></Text>
                <View style={[
                  styles.inputContainer,
                  focusedField === 'make' && styles.inputFocused,
                  shouldShowError('make') ? styles.inputError : null,
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Honda"
                    placeholderTextColor={colors.textMuted}
                    value={make}
                    autoCapitalize="words"
                    autoCorrect={false}
                    onChangeText={(text) => {
                      setMake(text);
                      if (errors.make) setErrors(prev => ({ ...prev, make: '' }));
                    }}
                    onFocus={() => {
                      setFocusedField('make');
                      setIsTypeDropdownOpen(false);
                    }}
                    onBlur={() => handleBlur('make', make)}
                  />
                </View>
                {shouldShowError('make') ? <Text style={styles.validationError}>{errors.make}</Text> : null}
              </View>

              <View style={styles.spacer} />

              {/* Vehicle Model (Text Input) */}
              <View style={styles.flexHalf}>
                <Text style={styles.inputLabel}>Vehicle Model <Text style={styles.required}>*</Text></Text>
                <View style={[
                  styles.inputContainer,
                  focusedField === 'model' && styles.inputFocused,
                  shouldShowError('model') ? styles.inputError : null,
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Activa 6G"
                    placeholderTextColor={colors.textMuted}
                    value={model}
                    autoCapitalize="words"
                    autoCorrect={false}
                    onChangeText={(text) => {
                      setModel(text);
                      if (errors.model) setErrors(prev => ({ ...prev, model: '' }));
                    }}
                    onFocus={() => {
                      setFocusedField('model');
                      setIsTypeDropdownOpen(false);
                    }}
                    onBlur={() => handleBlur('model', model)}
                  />
                </View>
                {shouldShowError('model') ? <Text style={styles.validationError}>{errors.model}</Text> : null}
              </View>
            </View>

            {/* Continue CTA inside content container so stacking context stays unified */}
            <View style={styles.footer}>
              <PrimaryButton
                title="Continue"
                onPress={handleContinue}
                disabled={!isFormValid}
              />
            </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 40,
  },
  backButtonPlaceholder: {
    width: 40,
  },

  content: {
    marginTop: spacing.xs,
    position: 'relative',
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

  dropdownContainer: {
    height: 48,
    paddingHorizontal: spacing.m,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: colors.textMuted,
  },

  typeDropdownWrapper: {
    position: 'relative',
    zIndex: 100,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: -600,
    bottom: -600,
    left: -200,
    right: -200,
    zIndex: 999,
  },
  typeDropdownList: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 16,
    backgroundColor: colors.white,
    overflow: 'hidden',
    zIndex: 1000,
    shadowColor: '#1A2C5B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  typeDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F2EE',
  },
  typeDropdownItemActive: {
    backgroundColor: '#FFF0E8',
  },
  typeDropdownItemText: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
  },
  typeDropdownItemTextActive: {
    color: colors.primary,
    fontWeight: '600',
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

  footer: {
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 0,
  },
});
