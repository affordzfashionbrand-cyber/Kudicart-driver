import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { KudiIcon } from '../KudiIcon';
import { SurgeIncentive, useDriverStore } from '../../store/useDriverStore';
import { styles } from './surge.styles';

export interface SurgeDetailsSheetProps {
  visible: boolean;
  onClose: () => void;
  incentives?: SurgeIncentive[];
}

export const SurgeDetailsSheet: React.FC<SurgeDetailsSheetProps> = ({
  visible,
  onClose,
  incentives: propIncentives,
}) => {
  const storeIncentives = useDriverStore((s) => s.activeSurges);
  const activeList = propIncentives !== undefined ? propIncentives : storeIncentives || [];

  if (!visible || activeList.length === 0) return null;

  return (
    <View style={styles.overlayContainer}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.bottomSheet}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderLeft}>
              <Text style={styles.sheetTitle}>Active Surge & Incentives</Text>
              <Text style={styles.sheetSubtitle}>
                {activeList.length} live {activeList.length === 1 ? 'incentive' : 'incentives'} active in your zone
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Close active incentives"
            >
              <KudiIcon name="close" size={20} color="#65635F" />
            </TouchableOpacity>
          </View>

          {/* Incentives List */}
          <View style={styles.incentivesList}>
            {activeList.map((inc) => {
              const incIsRain = inc.type === 'RAIN_SURGE';
              return (
                <View key={inc.id} style={styles.detailCard}>
                  <View style={styles.detailCardHeader}>
                    <View
                      style={[
                        styles.detailIconWrap,
                        incIsRain ? styles.iconContainerRain : styles.iconContainerSurge,
                      ]}
                    >
                      <KudiIcon
                        name={incIsRain ? 'cloud-rain' : 'zap'}
                        size={18}
                        color="#D94B17"
                      />
                    </View>
                    <View style={styles.detailCardTitleCol}>
                      <Text style={styles.detailCardHeadline}>{inc.headline}</Text>
                      <Text style={styles.detailCardZone}>
                        {inc.zone || 'Active in your hub area'}
                      </Text>
                    </View>
                    <View style={styles.detailAmountBadge}>
                      <Text style={styles.detailAmountText}>{inc.amountText}</Text>
                    </View>
                  </View>

                  <Text style={styles.detailCardDesc}>{inc.supportingText}</Text>

                  {inc.condition && (
                    <View style={styles.detailConditionRow}>
                      <KudiIcon name="info-circle" size={12} color="#65635F" />
                      <Text style={styles.detailConditionText}>{inc.condition}</Text>
                    </View>
                  )}

                  {inc.timeRemaining && (
                    <View style={styles.detailTimeRow}>
                      <KudiIcon name="clock" size={12} color="#D94B17" />
                      <Text style={styles.detailTimeText}>{inc.timeRemaining}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.payoutNotice}>
            <KudiIcon name="check-circle" size={14} color="#16805A" />
            <Text style={styles.payoutNoticeText}>
              Extra earnings are credited automatically to your daily ledger upon delivery confirmation.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.sheetCloseButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.sheetCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};
