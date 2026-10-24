import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { dashboardStyles as styles } from './dashboard.styles';

export const DashboardOpportunitiesSection: React.FC = () => {
  const [oppTab, setOppTab] = useState<'01' | '02'>('01');
  const [oppSectionWidth, setOppSectionWidth] = useState(0);

  const oppBannerWidth = 310;
  const oppSidePadding = oppSectionWidth > 0 ? (oppSectionWidth - oppBannerWidth) / 2 : 0;

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
            const newTab = page === 0 ? '01' : '02';
            if (oppTab !== newTab) setOppTab(newTab);
          }}
          scrollEventThrottle={16}
        >
          <View style={{ width: Math.max(0, oppSidePadding - 16) }} />

          {/* BANNER 1: Primary Opportunity */}
          <View style={[styles.opportunityBanner, styles.bannerPrimary]}>
            <Text style={styles.bannerSuperTitle}>EXTRA EARNING</Text>

            <View style={styles.bannerMid}>
              <Text style={styles.bannerAmount}>₹200 <Text style={styles.bannerType}>BONUS</Text></Text>
            </View>

            <View style={styles.bannerBottom}>
              <Text style={styles.bannerDesc}>Complete 5 orders by 2 PM</Text>
              <TouchableOpacity style={styles.bannerAction}>
                <Text style={styles.bannerActionText}>View offer →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* BANNER 2: Secondary Opportunity */}
          <View style={[styles.opportunityBanner, styles.bannerSecondary]}>
            <Text style={[styles.bannerSuperTitle, { color: '#8A8781' }]}>PEAK HOURS</Text>

            <View style={styles.bannerMid}>
              <Text style={styles.bannerAmount}>₹250 <Text style={styles.bannerType}>BONUS</Text></Text>
            </View>

            <View style={styles.bannerBottom}>
              <Text style={[styles.bannerDesc, { color: '#65635F' }]}>11 AM – 3 PM · More orders expected</Text>
              <TouchableOpacity style={styles.bannerAction}>
                <Text style={[styles.bannerActionText, { color: '#171716' }]}>View details →</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ width: Math.max(0, oppSidePadding - 16) }} />
        </ScrollView>
      )}

      <View style={styles.oppPagerIndicatorContainer}>
        <View style={[styles.pagerDot, oppTab === '01' && styles.pagerDotActive]} />
        <View style={[styles.pagerDot, oppTab === '02' && styles.pagerDotActive]} />
      </View>
    </View>
  );
};
