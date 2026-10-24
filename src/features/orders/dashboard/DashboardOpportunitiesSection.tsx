import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { dashboardStyles as styles } from './dashboard.styles';
import { earningsApi } from '../../../api';

export const DashboardOpportunitiesSection: React.FC = () => {
  const [oppIndex, setOppIndex] = useState(0);
  const [oppSectionWidth, setOppSectionWidth] = useState(0);
  const [opportunities, setOpportunities] = useState<any[]>([]);

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

  const oppBannerWidth = 310;
  const oppSidePadding = oppSectionWidth > 0 ? (oppSectionWidth - oppBannerWidth) / 2 : 0;

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
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 16,
          }}
          snapToInterval={oppBannerWidth + 16}
          decelerationRate="fast"
          snapToAlignment="center"
          onScroll={(e) => {
            const page = Math.round(e.nativeEvent.contentOffset.x / (oppBannerWidth + 16));
            if (oppIndex !== page) setOppIndex(page);
          }}
          scrollEventThrottle={16}
        >
          <View style={{ width: Math.max(0, oppSidePadding - 16) }} />

          {opportunities.map((opp, idx) => {
            const isPrimary = idx % 2 === 0;
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
                    {opp.bonusText?.split(' ')[0] || '₹100'}{' '}
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
                  <TouchableOpacity style={styles.bannerAction}>
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
            <View
              key={i}
              style={[styles.pagerDot, oppIndex === i && styles.pagerDotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
};
