import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { KudiIcon } from './KudiIcon';
import { SurgeIncentive, useDriverStore } from '../store/useDriverStore';
import { styles } from './surge/surge.styles';
import { SurgeDetailsSheet, SurgeDetailsSheetProps } from './surge/SurgeDetailsSheet';

export { SurgeDetailsSheet };
export type { SurgeDetailsSheetProps };

export interface SurgeBannerProps {
  incentives?: SurgeIncentive[];
  style?: StyleProp<ViewStyle>;
  onPressDetails?: () => void;
}

export const SurgeBanner: React.FC<SurgeBannerProps> = ({
  incentives: propIncentives,
  style,
  onPressDetails,
}) => {
  const storeIncentives = useDriverStore((s) => s.activeSurges);
  const activeList = propIncentives !== undefined ? propIncentives : storeIncentives || [];

  const [internalShowDetails, setInternalShowDetails] = useState(false);

  // Requirement: "No active surge: hide the banner completely. Don't leave an empty placeholder."
  if (!activeList || activeList.length === 0) {
    return null;
  }

  // Requirement: "Multiple active incentives: show one relevant, eligible offer in the banner; let View details expose the other applicable incentives."
  const primaryIncentive = activeList[0];
  const hasMultiple = activeList.length > 1;
  const isRain = primaryIncentive.type === 'RAIN_SURGE';

  const handleOpen = () => {
    if (onPressDetails) {
      onPressDetails();
    } else {
      setInternalShowDetails(true);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.bannerContainer, style]}
        onPress={handleOpen}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${primaryIncentive.headline}: ${primaryIncentive.supportingText}. Tap to view incentive details.`}
      >
        {/* Left: Icon container (36–40px) */}
        <View
          style={[
            styles.iconContainer,
            isRain ? styles.iconContainerRain : styles.iconContainerSurge,
          ]}
        >
          <KudiIcon
            name={isRain ? 'cloud-rain' : 'zap'}
            size={20}
            color="#D94B17"
          />
        </View>

        {/* Center: Headline & Supporting Text */}
        <View style={styles.contentCol}>
          <View style={styles.headlineRow}>
            <Text style={styles.headlineText} numberOfLines={1}>
              {primaryIncentive.headline}
            </Text>
            <View style={styles.amountPill}>
              <Text style={styles.amountPillText}>{primaryIncentive.amountText}</Text>
            </View>
          </View>
          <Text style={styles.supportingText} numberOfLines={2}>
            {primaryIncentive.supportingText}
            {primaryIncentive.timeRemaining ? ` · ${primaryIncentive.timeRemaining}` : ''}
          </Text>
        </View>

        {/* Right: View details action */}
        <View style={styles.actionCol}>
          {hasMultiple && (
            <View style={styles.multiBadge}>
              <Text style={styles.multiBadgeText}>{activeList.length} Active</Text>
            </View>
          )}
          <View style={styles.viewDetailsRow}>
            <Text style={styles.viewDetailsText}>View details</Text>
            <KudiIcon name="chevron-right" size={13} color="#D94B17" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Fallback internal sheet if parent doesn't handle sheet placement */}
      {!onPressDetails && (
        <SurgeDetailsSheet
          visible={internalShowDetails}
          onClose={() => setInternalShowDetails(false)}
          incentives={activeList}
        />
      )}
    </>
  );
};
