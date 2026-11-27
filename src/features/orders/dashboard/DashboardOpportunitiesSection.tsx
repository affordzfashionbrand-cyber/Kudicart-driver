import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { dashboardStyles as styles } from './dashboard.styles';
import { earningsApi } from '../../../api';

const AUTO_SCROLL_INTERVAL_MS = 4000;
const RESUME_AFTER_INTERACTION_MS = 3500;

interface DashboardOpportunitiesSectionProps {
  navigation?: any;
}

export const DashboardOpportunitiesSection: React.FC<DashboardOpportunitiesSectionProps> = ({
  navigation,
}) => {
  const isFocused = useIsFocused();
  const [oppIndex, setOppIndex] = useState(0);
  const [oppSectionWidth, setOppSectionWidth] = useState(0);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const scrollRef = useRef<ScrollView | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    earningsApi
      .getOpportunities()
      .then((data) => {
        if (Array.isArray(data)) {
          setOpportunities(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const oppBannerWidth = 310;
  const itemStride = oppBannerWidth + 16;
  const oppSidePadding = oppSectionWidth > 0 ? (oppSectionWidth - oppBannerWidth) / 2 : 0;

  const pauseTemporarily = useCallback(() => {
    setIsPaused(true);
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, RESUME_AFTER_INTERACTION_MS);
  }, []);

  useEffect(() => {
    if (
      !isFocused ||
      isPaused ||
      opportunities.length <= 1 ||
      oppSectionWidth <= 0
    ) {
      return;
    }

    const timer = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % opportunities.length;
      currentIndexRef.current = nextIndex;
      setOppIndex(nextIndex);
      scrollRef.current?.scrollTo({
        x: nextIndex * itemStride,
        y: 0,
        animated: true,
      });
    }, AUTO_SCROLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isFocused, isPaused, opportunities.length, oppSectionWidth, itemStride]);

  if (opportunities.length === 0) {
    return null;
  }

  return (
    <View
      style={styles.opportunitiesSection}
      onLayout={(e) => setOppSectionWidth(e.nativeEvent.layout.width)}
    >
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>For you</Text>
      </View>

      {oppSectionWidth > 0 && (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 16,
          }}
          snapToInterval={itemStride}
          decelerationRate="fast"
          snapToAlignment="center"
          onTouchStart={pauseTemporarily}
          onScrollBeginDrag={pauseTemporarily}
          onScrollEndDrag={scheduleResume}
          onMomentumScrollEnd={scheduleResume}
          onScroll={(e) => {
            const page = Math.max(
              0,
              Math.min(
                opportunities.length - 1,
                Math.round(e.nativeEvent.contentOffset.x / itemStride),
              ),
            );
            currentIndexRef.current = page;
            if (oppIndex !== page) setOppIndex(page);
          }}
          scrollEventThrottle={16}
        >
          <View style={{ width: Math.max(0, oppSidePadding - 16) }} />

          {opportunities.map((opp, idx) => {
            const isPrimary = idx % 2 === 0;
            const bonusDisplay =
              opp.bonusAmount != null
                ? `+₹${opp.bonusAmount}`
                : opp.bonusText?.split(' ')[0] || '';
            return (
              <View
                key={opp.id || idx}
                style={[
                  styles.opportunityBanner,
                  isPrimary ? styles.bannerPrimary : styles.bannerSecondary,
                ]}
              >
                <Text
                  style={[
                    styles.bannerSuperTitle,
                    !isPrimary && { color: '#8A8781' },
                  ]}
                >
                  {opp.urgency || 'EXTRA EARNING'}
                </Text>

                <View style={styles.bannerMid}>
                  <Text style={styles.bannerAmount}>
                    {bonusDisplay}{' '}
                    <Text style={styles.bannerType}>INCENTIVE</Text>
                  </Text>
                </View>

                <View style={styles.bannerBottom}>
                  <Text
                    style={[
                      styles.bannerDesc,
                      !isPrimary && { color: '#65635F' },
                    ]}
                  >
                    {opp.title}: {opp.timeWindow}
                  </Text>
                  <TouchableOpacity
                    style={styles.bannerAction}
                    onPress={() =>
                      navigation?.navigate?.('IncentiveDetails', {
                        mode: 'opportunity',
                        opportunity: opp,
                      })
                    }
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={`View offer ${opp.title}`}
                  >
                    <Text
                      style={[
                        styles.bannerActionText,
                        !isPrimary && { color: '#171716' },
                      ]}
                    >
                      View offer →
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <View style={{ width: Math.max(0, oppSidePadding - 16) }} />
        </ScrollView>
      )}

      {opportunities.length > 1 && (
        <View style={styles.oppPagerIndicatorContainer}>
          {opportunities.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                pauseTemporarily();
                currentIndexRef.current = i;
                setOppIndex(i);
                scrollRef.current?.scrollTo({ x: i * itemStride, y: 0, animated: true });
                scheduleResume();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <View style={[styles.pagerDot, oppIndex === i && styles.pagerDotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};
