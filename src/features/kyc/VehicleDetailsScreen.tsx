import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { useDriverStore } from '../../store/useDriverStore';
import logo from '../../assets/logo.png';
import { KudiIcon } from '../../components/KudiIcon';
import {
  VEHICLE_TYPES,
  isValidRCPrefix,
  formatRC,
  getVehicleFieldError,
} from './vehicleValidation';
import { styles } from './vehicleDetails.styles';

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

  const shouldShowError = (field: string) => {
    return (hasSubmitted || !!touchedFields[field]) && !!errors[field];
  };

  const handleBlur = (field: string, value: string) => {
    setFocusedField(null);
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    const error = getVehicleFieldError(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validate = () => {
    const newErrors = {
      registrationNumber: getVehicleFieldError('registrationNumber', registrationNumber),
      vehicleType: getVehicleFieldError('vehicleType', vehicleType),
      make: getVehicleFieldError('make', make),
      model: getVehicleFieldError('model', model),
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
        registrationNumber,
        vehicleType: vehicleType as any,
        make,
        model,
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
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header matched to Login Screen with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <KudiIcon name="arrow-left" size={24} color={colors.text} />
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
              Provide details of the vehicle you will use for order deliveries.
            </Text>

            {/* Registration Number */}
            <Text style={styles.inputLabel}>
              Registration No. (RC) <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.inputContainer,
                focusedField === 'registration' && styles.inputFocused,
                shouldShowError('registrationNumber') ? styles.inputError : null,
              ]}
            >
              <TextInput
                style={[styles.input, { textTransform: 'uppercase' }]}
                placeholder="MH 01 AB 1234 or 22 BH 1234 AA"
                placeholderTextColor={colors.textMuted}
                value={registrationNumber}
                autoCapitalize="characters"
                autoCorrect={false}
                autoComplete="off"
                textContentType="none"
                maxLength={16}
                onChangeText={(text) => {
                  if (errors.registrationNumber)
                    setErrors((prev) => ({ ...prev, registrationNumber: '' }));

                  const rawCleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  if (!isValidRCPrefix(rawCleaned)) {
                    return;
                  }

                  const isMiddleEdit =
                    !text.startsWith(registrationNumber) &&
                    !registrationNumber.startsWith(text) &&
                    text !== '';
                  if (isMiddleEdit) setRegistrationNumber(text);
                  else setRegistrationNumber(formatRC(text));
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
            {shouldShowError('registrationNumber') ? (
              <Text style={styles.validationError}>{errors.registrationNumber}</Text>
            ) : null}

            {/* Vehicle Type Dropdown */}
            <View style={styles.typeDropdownWrapper}>
              <Text style={[styles.inputLabel, styles.fieldMargin]}>
                Vehicle Type <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  styles.dropdownContainer,
                  isTypeDropdownOpen && styles.inputFocused,
                  shouldShowError('vehicleType') ? styles.inputError : null,
                ]}
                onPress={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !vehicleType && styles.placeholderText,
                  ]}
                >
                  {vehicleType || 'Select vehicle type'}
                </Text>
                <KudiIcon
                  name={isTypeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              {shouldShowError('vehicleType') ? (
                <Text style={styles.validationError}>{errors.vehicleType}</Text>
              ) : null}

              {isTypeDropdownOpen && (
                <>
                  <TouchableOpacity
                    style={styles.dropdownBackdrop}
                    activeOpacity={1}
                    onPress={() => setIsTypeDropdownOpen(false)}
                  />
                  <View style={styles.typeDropdownList}>
                    {VEHICLE_TYPES.map((type) => {
                      const isSelected = vehicleType === type;
                      return (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.typeDropdownItem,
                            isSelected && styles.typeDropdownItemActive,
                          ]}
                          onPress={() => {
                            setVehicleType(type);
                            setIsTypeDropdownOpen(false);
                            setTouchedFields((prev) => ({ ...prev, vehicleType: true }));
                            if (errors.vehicleType)
                              setErrors((prev) => ({ ...prev, vehicleType: '' }));
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
                          {isSelected && (
                            <KudiIcon name="check" size={16} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </View>

            {/* Make & Model in a single row */}
            <View style={styles.rowInputs}>
              <View style={styles.flexHalf}>
                <Text style={styles.inputLabel}>
                  Make <Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'make' && styles.inputFocused,
                    shouldShowError('make') ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Honda"
                    placeholderTextColor={colors.textMuted}
                    value={make}
                    autoCorrect={false}
                    onChangeText={(text) => {
                      setMake(text);
                      if (errors.make) setErrors((prev) => ({ ...prev, make: '' }));
                    }}
                    onFocus={() => {
                      setFocusedField('make');
                      setIsTypeDropdownOpen(false);
                    }}
                    onBlur={() => handleBlur('make', make)}
                  />
                </View>
                {shouldShowError('make') ? (
                  <Text style={styles.validationError}>{errors.make}</Text>
                ) : null}
              </View>

              <View style={styles.spacer} />

              <View style={styles.flexHalf}>
                <Text style={styles.inputLabel}>
                  Model <Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'model' && styles.inputFocused,
                    shouldShowError('model') ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Activa 6G"
                    placeholderTextColor={colors.textMuted}
                    value={model}
                    autoCorrect={false}
                    onChangeText={(text) => {
                      setModel(text);
                      if (errors.model) setErrors((prev) => ({ ...prev, model: '' }));
                    }}
                    onFocus={() => {
                      setFocusedField('model');
                      setIsTypeDropdownOpen(false);
                    }}
                    onBlur={() => handleBlur('model', model)}
                  />
                </View>
                {shouldShowError('model') ? (
                  <Text style={styles.validationError}>{errors.model}</Text>
                ) : null}
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
