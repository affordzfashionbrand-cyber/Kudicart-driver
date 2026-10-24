import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './driverDetails.styles';

interface WorkPreferenceSelectorProps {
  value: string;
  onChange: (pref: 'FULL_TIME' | 'PART_TIME') => void;
  showError?: boolean;
  errorMessage?: string;
}

export const WorkPreferenceSelector: React.FC<WorkPreferenceSelectorProps> = ({
  value,
  onChange,
  showError,
  errorMessage,
}) => {
  return (
    <>
      <Text style={[styles.inputLabel, styles.sectionMargin]}>
        Work Preference <Text style={styles.required}>*</Text>
      </Text>
      <Text style={styles.sectionDescription}>How would you like to work?</Text>

      <View style={styles.preferenceRow}>
        <TouchableOpacity
          style={[
            styles.radioCard,
            value === 'FULL_TIME'
              ? styles.radioCardSelected
              : styles.radioCardUnselected,
          ]}
          onPress={() => onChange('FULL_TIME')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.radioCircle,
              value === 'FULL_TIME'
                ? styles.radioCircleSelected
                : styles.radioCircleUnselected,
            ]}
          >
            {value === 'FULL_TIME' && <View style={styles.radioInnerDot} />}
          </View>
          <Text style={styles.radioLabel}>Full-time</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={[
            styles.radioCard,
            value === 'PART_TIME'
              ? styles.radioCardSelected
              : styles.radioCardUnselected,
          ]}
          onPress={() => onChange('PART_TIME')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.radioCircle,
              value === 'PART_TIME'
                ? styles.radioCircleSelected
                : styles.radioCircleUnselected,
            ]}
          >
            {value === 'PART_TIME' && <View style={styles.radioInnerDot} />}
          </View>
          <Text style={styles.radioLabel}>Part-time</Text>
        </TouchableOpacity>
      </View>
      {showError && errorMessage ? (
        <Text style={styles.validationError}>{errorMessage}</Text>
      ) : null}
    </>
  );
};
