import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Order } from '../../../store/useOrderStore';
import { KudiIcon } from '../../../components/KudiIcon';
import { styles } from './trialProgress.styles';

interface TryAndBuyTrialProgressViewProps {
  order: Order;
  onRefreshSelection?: () => void;
  onContactCustomer?: () => void;
  onBack?: () => void;
}

const defaultThumbnails = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120&q=80',
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=120&q=80',
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=120&q=80',
];

export const TryAndBuyTrialProgressView: React.FC<TryAndBuyTrialProgressViewProps> = ({
  order,
  onRefreshSelection,
  onContactCustomer,
  onBack,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(() => {
    if (!order.trialEndsAt) return null;
    const diff = Math.floor((new Date(order.trialEndsAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  const totalDurationSeconds = (order.trialDurationMinutes || 10) * 60;

  useEffect(() => {
    if (!order.trialEndsAt) {
      setSecondsRemaining(null);
      return;
    }
    const updateCountdown = () => {
      const diff = Math.floor((new Date(order.trialEndsAt!).getTime() - Date.now()) / 1000);
      setSecondsRemaining(Math.max(0, diff));
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [order.trialEndsAt]);

  const isAwaitingServer = secondsRemaining === null;
  const isExpired = secondsRemaining === 0;

  let formattedTime = 'Syncing...';
  let progressPercent = 0;

  if (secondsRemaining !== null) {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    progressPercent = Math.min(
      100,
      Math.max(0, ((totalDurationSeconds - secondsRemaining) / totalDurationSeconds) * 100),
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <KudiIcon name="arrow-left" size={20} color="#171716" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Trial in progress</Text>
        <Text style={styles.topBarOrderId}>{order.id}</Text>
      </View>

      {/* 2. SCROLL CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TIMER CARD */}
        <View style={styles.timerCard}>
          <Text style={styles.timerSuper}>TIME REMAINING</Text>
          <Text
            style={[
              styles.timerDisplay,
              isExpired && { color: '#DA1E28' },
              isAwaitingServer && { fontSize: 20, color: '#6F6F6F' },
            ]}
          >
            {isAwaitingServer
              ? 'Awaiting server session...'
              : isExpired
              ? '00:00 (Expired)'
              : formattedTime}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>

          <Text style={styles.timerHeadline}>Customer is trying the items</Text>
          <Text style={styles.timerSub}>
            “Wait while the customer checks the products. Their selections will appear here.”
          </Text>
        </View>

        {/* CUSTOMER CONTEXT & GUIDANCE */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Customer & location</Text>
          <View style={styles.customerRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.customerName}>{order.customerName}</Text>
              <Text style={styles.customerAddress}>{order.customerAddress}</Text>
            </View>
            <TouchableOpacity
              style={styles.actionCircle}
              onPress={onContactCustomer}
              accessibilityRole="button"
              accessibilityLabel="Call customer"
            >
              <KudiIcon name="phone" size={18} color="#FF5A1F" />
            </TouchableOpacity>
          </View>

          <View style={styles.partnerNote}>
            <KudiIcon name="info-circle" size={16} color="#65635F" />
            <Text style={styles.partnerNoteText}>
              Please remain near the delivery point. You will receive an alert as soon as {order.customerName} confirms choices.
            </Text>
          </View>
        </View>

        {/* ITEMS CURRENTLY BEING TRIED */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionLabel}>Items on trial</Text>
            <Text style={styles.cardHeaderMeta}>{order.items?.length || 3} items</Text>
          </View>

          {order.items?.map((item, index) => {
            const isLast = index === order.items!.length - 1;
            return (
              <View
                key={item.id || index}
                style={[styles.productRow, !isLast && styles.productBorder]}
              >
                <Image
                  source={{ uri: defaultThumbnails[index % defaultThumbnails.length] }}
                  style={styles.productThumb}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  {item.variant ? <Text style={styles.productVariant}>{item.variant}</Text> : null}
                  <Text style={styles.productPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.evaluatingBadge}>
                  <Text style={styles.evaluatingText}>Trying</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* LIVE CUSTOMER SELECTION STATUS (CUSTOMER APP SYNC) */}
        <View style={[styles.card, styles.simulationCard]}>
          <View style={styles.simulationHeader}>
            <KudiIcon name="clipboard-list" size={16} color="#FF5A1F" />
            <Text style={styles.simulationTitle}>Awaiting Customer Selection</Text>
          </View>
          <Text style={styles.simulationSub}>
            Customer submits Keep / Return item choices directly in their KudiCart app. This screen updates automatically once confirmed.
          </Text>

          {onRefreshSelection && (
            <View style={styles.simulationBtnGrid}>
              <TouchableOpacity
                style={[styles.simBtn, styles.simBtnPrimary]}
                onPress={onRefreshSelection}
                activeOpacity={0.85}
              >
                <Text style={styles.simBtnTitle}>Check Selection Status</Text>
                <Text style={styles.simBtnDetail}>Sync latest Try & Buy decisions from server</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

