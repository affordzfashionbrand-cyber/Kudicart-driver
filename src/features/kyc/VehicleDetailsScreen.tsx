import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Image, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useDriverStore } from '../../store/useDriverStore';
import logo from '../../assets/logo.png';
import { KudiIcon } from '../../components/KudiIcon';

export const VehicleDetailsScreen = ({ navigation }: any) => {
  const { vehicle, updateVehicle } = useDriverStore();

  const [registrationNumber, setRegistrationNumber] = useState(vehicle.registrationNumber || '');
  const [vehicleType, setVehicleType] = useState(vehicle.vehicleType || '');
  const [make, setMake] = useState(vehicle.make || '');
  const [model, setModel] = useState(vehicle.model || '');
  
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const vehicleTypes = ['Bike', 'Scooty', 'EV Bike', 'EV Scooty'];

  const formatRC = (val: string) => {
    let cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let match = cleaned.match(/^([A-Z]{0,2})([0-9]{0,2})([A-Z]{0,2})([0-9]{0,4})/);
    if (!match) return cleaned;
    
    let state = match[1];
    let rto = match[2];
    let series = match[3];
    let unique = match[4];
    
    let result = state;
    if (rto) result += '-' + rto;
    if (series) result += '-' + series;
    if (unique) result += '-' + unique;
    
    return result;
  };

  const validate = () => {
    let newErrors: { [key: string]: string } = {};
    
    if (!registrationNumber.trim()) newErrors.registrationNumber = 'Registration Number is required';
    else if (!/^[A-Z]{2}-[0-9]{2}-[A-Z]{1,2}-[0-9]{4}$/i.test(registrationNumber.trim())) newErrors.registrationNumber = 'Enter a valid registration number (e.g. MH-01-AB-1234)';

    if (!vehicleType) newErrors.vehicleType = 'Please select a vehicle type';

    if (!make.trim()) newErrors.make = 'Vehicle Make is required';
    else if (make.trim().length < 2) newErrors.make = 'Make is too short';

    if (!model.trim()) newErrors.model = 'Vehicle Model is required';
    else if (model.trim().length < 2) newErrors.model = 'Model is too short';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      updateVehicle({ registrationNumber, vehicleType, make, model });
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
          
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <KudiIcon name="arrow-left" color={colors.primary} size={24} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            </View>
            <View style={styles.backButtonPlaceholder} />
          </View>

          <View style={styles.content}>
            <Text style={styles.stepText}>PARTNER KYC • STEP 2 OF 3</Text>

            <Text style={styles.title}>Vehicle Details</Text>
            <Text style={styles.subtitle}>
              Please provide the details of the vehicle you will use for deliveries.
            </Text>

            <Text style={styles.inputLabel}>Registration Number <Text style={styles.required}>*</Text></Text>
            <View style={[
              styles.inputContainer, 
              focusedField === 'registration' && styles.inputFocused,
              errors.registrationNumber ? styles.inputError : null
            ]}>
              <TextInput 
                style={[styles.input, { textTransform: 'uppercase' }]}
                placeholder="TN-01-AB-1234"
                placeholderTextColor={colors.textMuted}
                value={registrationNumber}
                autoCapitalize="characters"
                maxLength={14}
                onChangeText={(text) => {
                  if (errors.registrationNumber) setErrors(prev => ({...prev, registrationNumber: ''}));
                  if (text.length > registrationNumber.length) {
                    let i = 0;
                    while (i < registrationNumber.length && text[i] === registrationNumber[i]) i++;
                    let inserted = text[i];
                    if (inserted && inserted !== '-') {
                      let cleanedSoFar = text.substring(0, i).replace(/[^A-Z0-9]/gi, '');
                      let len = cleanedSoFar.length;
                      let isValid = true;
                      if (len < 2) isValid = /[A-Z]/i.test(inserted);
                      else if (len < 4) isValid = /[0-9]/.test(inserted);
                      else if (len === 4) isValid = /[A-Z]/i.test(inserted);
                      else if (len === 5) isValid = /[A-Z0-9]/i.test(inserted);
                      else if (len > 5) isValid = /[0-9]/.test(inserted);
                      
                      if (!isValid) {
                        setRegistrationNumber(registrationNumber);
                        return;
                      }
                    }
                  }
                  
                  const isMiddleEdit = !text.startsWith(registrationNumber) && !registrationNumber.startsWith(text) && text !== '';
                  if (isMiddleEdit) setRegistrationNumber(text);
                  else setRegistrationNumber(formatRC(text));
                }}
                onFocus={() => setFocusedField('registration')}
                onBlur={() => {
                  const formatted = formatRC(registrationNumber);
                  setRegistrationNumber(formatted);
                  setFocusedField(null);
                }}
              />
            </View>
            {errors.registrationNumber ? <Text style={styles.validationError}>{errors.registrationNumber}</Text> : null}

            <Text style={[styles.inputLabel, { marginTop: spacing.xl }]}>Vehicle Type <Text style={styles.required}>*</Text></Text>
            <View style={{ zIndex: 1000, position: 'relative' }}>
              <TouchableOpacity 
                activeOpacity={0.8}
                style={[
                  styles.inputContainer,
                  styles.dropdownContainer,
                  isDropdownOpen && styles.inputFocused,
                  errors.vehicleType ? styles.inputError : null,
                  isDropdownOpen && styles.dropdownContainerOpen
                ]}
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Text style={[styles.dropdownText, !vehicleType && { color: colors.textMuted }]}>
                  {vehicleType || 'Select Vehicle Type'}
                </Text>
                <KudiIcon name={isDropdownOpen ? 'chevron-up' : 'chevron-down'} color={colors.textSecondary} size={12} />
              </TouchableOpacity>
              
              {isDropdownOpen && (
                <View style={[styles.dropdownList, styles.dropdownListOpen]}>
                {vehicleTypes.map((type, index) => (
                  <TouchableOpacity 
                    key={type}
                    style={[
                      styles.dropdownItem,
                      index === vehicleTypes.length - 1 && { borderBottomWidth: 0 },
                      vehicleType === type && styles.dropdownItemActive
                    ]}
                    onPress={() => {
                      setVehicleType(type);
                      setErrors(prev => ({...prev, vehicleType: ''}));
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      vehicleType === type && { color: colors.primary, fontWeight: '600' }
                    ]}>{type}</Text>
                    {vehicleType === type && <KudiIcon name="check" color={colors.primary} size={14} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            </View>
            {errors.vehicleType ? <Text style={styles.validationError}>{errors.vehicleType}</Text> : null}

            <View style={styles.rowInputs}>
              <View style={styles.flexHalf}>
                <Text style={styles.inputLabel}>Vehicle Make <Text style={styles.required}>*</Text></Text>
                <View style={[
                  styles.inputContainer, 
                  focusedField === 'make' && styles.inputFocused,
                  errors.make ? styles.inputError : null
                ]}>
                  <TextInput 
                    style={styles.input}
                    placeholder="e.g. Honda"
                    placeholderTextColor={colors.textMuted}
                    value={make}
                    onChangeText={(text) => { setMake(text); setErrors(prev => ({...prev, make: ''})); }}
                    onFocus={() => setFocusedField('make')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                {errors.make ? <Text style={styles.validationError}>{errors.make}</Text> : null}
              </View>

              <View style={styles.spacer} />

              <View style={styles.flexHalf}>
                <Text style={styles.inputLabel}>Vehicle Model <Text style={styles.required}>*</Text></Text>
                <View style={[
                  styles.inputContainer, 
                  focusedField === 'model' && styles.inputFocused,
                  errors.model ? styles.inputError : null
                ]}>
                  <TextInput 
                    style={styles.input}
                    placeholder="e.g. Activa 6G"
                    placeholderTextColor={colors.textMuted}
                    value={model}
                    onChangeText={(text) => { setModel(text); setErrors(prev => ({...prev, model: ''})); }}
                    onFocus={() => setFocusedField('model')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
                {errors.model ? <Text style={styles.validationError}>{errors.model}</Text> : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  backButton: {
    width: 40, height: 40, justifyContent: 'center',
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
    marginTop: spacing.s,
    zIndex: 10,
    elevation: 10,
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
    borderColor: '#E2E8F0',
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
  
  dropdownContainer: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    justifyContent: 'space-between',
  },
  dropdownText: {
    ...typography.bodyLarge,
    fontWeight: '400',
    color: colors.text,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%', // Precisely anchors to the bottom of the toggle
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: colors.white,
    overflow: 'hidden',
    zIndex: 1000,
    shadowColor: '#1A2C5B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  dropdownContainerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    paddingBottom: spacing.l + 1.5, // compensate for lost border width
  },
  dropdownListOpen: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemActive: {
    backgroundColor: '#F0F4FF',
  },
  dropdownItemText: {
    ...typography.bodyLarge,
    color: colors.text,
  },
  
  rowInputs: { flexDirection: 'row', marginTop: spacing.xl },
  flexHalf: { flex: 1 },
  spacer: { width: spacing.m },
  
  footer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    zIndex: 1,
    elevation: 1,
  },
});
