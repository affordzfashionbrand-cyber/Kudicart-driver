import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { KudiIcon } from './KudiIcon';
import { SurgeIncentive, useDriverStore } from '../store/useDriverStore';

interface SurgeBannerProps {
  incentives?: SurgeIncentive[];
  style?: StyleProp<ViewStyle>;
  onPressDetails?: () => void;
}

interface SurgeDetailsSheetProps {
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
                    <View style={[styles.detailIconWrap, incIsRain ? styles.iconContainerRain : styles.iconContainerSurge]}>
                      <KudiIcon
                        name={incIsRain ? 'cloud-rain' : 'zap'}
                        size={18}
                        color="#D94B17"
                      />
                    </View>
                    <View style={styles.detailCardTitleCol}>
                      <Text style={styles.detailCardHeadline}>{inc.headline}</Text>
                      <Text style={styles.detailCardZone}>{inc.zone || 'Active in your hub area'}</Text>
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
        <View style={[styles.iconContainer, isRain ? styles.iconContainerRain : styles.iconContainerSurge]}>
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

const styles = StyleSheet.create({
  /* Banner Dimensions & Styling matching exact specs */
  bannerContainer: {
    width: '100%',
    minHeight: 96,
    maxHeight: 104,
    backgroundColor: '#FFF0E8',
    borderWidth: 1,
    borderColor: '#FFD6C5',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE2D5',
  },
  iconContainerSurge: {
    backgroundColor: '#FFE2D5',
  },
  iconContainerRain: {
    backgroundColor: '#FFE7DD',
  },
  contentCol: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: 'center',
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  headlineText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#D94B17',
    letterSpacing: 0.2,
  },
  amountPill: {
    backgroundColor: '#FFDAC8',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  amountPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B43403',
  },
  supportingText: {
    fontSize: 12,
    color: '#65635F',
    lineHeight: 16,
  },
  actionCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  multiBadge: {
    backgroundColor: '#FFE0D1',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  multiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D94B17',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D94B17',
  },

  /* In-Screen Overlay */
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D3CEC7',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sheetHeaderLeft: {
    flex: 1,
    paddingRight: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#171716',
    marginBottom: 2,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: '#65635F',
  },
  incentivesList: {
    gap: 12,
    marginBottom: 14,
  },
  detailCard: {
    backgroundColor: '#FFF8F4',
    borderWidth: 1,
    borderColor: '#FFDAC8',
    borderRadius: 14,
    padding: 14,
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  detailCardTitleCol: {
    flex: 1,
  },
  detailCardHeadline: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D94B17',
  },
  detailCardZone: {
    fontSize: 11,
    color: '#65635F',
    marginTop: 1,
  },
  detailAmountBadge: {
    backgroundColor: '#FFDAC8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  detailAmountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B43403',
  },
  detailCardDesc: {
    fontSize: 13,
    color: '#171716',
    lineHeight: 18,
    marginBottom: 6,
  },
  detailConditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  detailConditionText: {
    fontSize: 11,
    color: '#65635F',
    flex: 1,
  },
  detailTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  detailTimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D94B17',
  },
  payoutNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EDFDF5',
    borderWidth: 1,
    borderColor: '#C1F2D9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  payoutNoticeText: {
    fontSize: 11,
    color: '#16805A',
    flex: 1,
    lineHeight: 15,
  },
  sheetCloseButton: {
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCloseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
});
