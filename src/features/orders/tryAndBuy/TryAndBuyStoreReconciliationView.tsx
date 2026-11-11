import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Order } from '../../../store/useOrderStore';
import { KudiIcon } from '../../../components/KudiIcon';
import { styles } from './storeReconciliation.styles';

interface TryAndBuyStoreReconciliationViewProps {
  order: Order;
  onReconcileReturn: () => void;
  onRefreshStatus?: () => void;
  onBack?: () => void;
}

const defaultThumbnails = [
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=120&q=80',
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=120&q=80',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120&q=80',
];

export const TryAndBuyStoreReconciliationView: React.FC<TryAndBuyStoreReconciliationViewProps> = ({
  order,
  onReconcileReturn,
  onRefreshStatus,
  onBack,
}) => {
  const isSupervisorConfirmed = order.storeReconciliationStatus === 'RECONCILED';
  const returnedItems = (order.items || []).filter((i) => i.decision === 'RETURN');

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <KudiIcon name="arrow-left" size={20} color="#171716" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
        <Text style={styles.topBarTitle}>Return reconciliation</Text>
        <Text style={styles.topBarOrderId}>{order.id}</Text>
      </View>

      {/* 2. SCROLL CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* INSTRUCTION */}
        <View style={styles.banner}>
          <KudiIcon name="package" size={16} color="#FF5A1F" />
          <Text style={styles.bannerText}>
            Hand over returned items to the hub inventory supervisor for tag and barcode verification.
          </Text>
        </View>

        {/* RETURN MANIFEST CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionLabel}>Return manifest</Text>
            <View style={styles.manifestIdChip}>
              <Text style={styles.manifestIdText}>{order.returnManifestId || '#RM-9842'}</Text>
            </View>
          </View>

          <View style={styles.hubLocationRow}>
            <View style={styles.hubIconWrap}>
              <KudiIcon name="home" size={18} color="#FF5A1F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hubTitle}>{order.pickupLocation}</Text>
              <Text style={styles.hubSub}>Destination Hub • Inward Return Bay</Text>
            </View>
          </View>
        </View>

        {/* RETURNED ITEMS TO RECONCILE */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionLabel}>Inventory inwarding</Text>
            <Text style={styles.cardHeaderMeta}>{returnedItems.length} items</Text>
          </View>

          {returnedItems.map((item, index) => {
            const isLast = index === returnedItems.length - 1;

            return (
              <View
                key={item.id}
                style={[styles.itemRow, !isLast && styles.itemBorder]}
              >
                <Image
                  source={{ uri: defaultThumbnails[index % defaultThumbnails.length] }}
                  style={styles.itemThumb}
                  resizeMode="cover"
                />

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.variant ? <Text style={styles.itemVariant}>{item.variant}</Text> : null}
                  <View style={styles.statusRow}>
                    <KudiIcon name="check-circle" size={12} color="#16805A" />
                    <Text style={styles.statusText}>Tags verified • Original packaging</Text>
                  </View>
                </View>

                <View style={styles.qtyTag}>
                  <Text style={styles.qtyTagText}>×{item.quantity}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* RETURN PHOTOS ATTACHED */}
        {order.returnImages && order.returnImages.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Customer handover evidence</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbsScroll}>
              {order.returnImages.map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={styles.returnEvidenceThumb} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* HUB INVENTORY EXECUTIVE CONFIRMATION (READ-ONLY SERVER STATE) */}
        <View
          style={[styles.verificationCard, isSupervisorConfirmed && styles.verificationCardActive]}
        >
          <View style={[styles.checkbox, isSupervisorConfirmed && styles.checkboxActive]}>
            {isSupervisorConfirmed && <KudiIcon name="check" size={14} color="#FFFFFF" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.verificationTitle}>
              {isSupervisorConfirmed
                ? 'Hub supervisor receipt confirmed'
                : 'Awaiting hub supervisor verification'}
            </Text>
            <Text style={styles.verificationSub}>
              {isSupervisorConfirmed
                ? 'Darkstore inwarding executive has scanned barcodes and confirmed return condition.'
                : 'Hand over the returned garments to the darkstore supervisor to confirm inwarding in their portal.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 3. FIXED BOTTOM ACTION */}
      <View style={styles.footer}>
        {isSupervisorConfirmed ? (
          <TouchableOpacity
            style={[styles.primaryBtn, styles.primaryBtnActive]}
            onPress={onReconcileReturn}
            activeOpacity={0.88}
          >
            <Text style={[styles.primaryBtnText, styles.primaryBtnTextActive]}>
              Complete store return & reconcile
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              onRefreshStatus ? styles.primaryBtnActive : styles.primaryBtnDisabled,
            ]}
            onPress={onRefreshStatus}
            disabled={!onRefreshStatus}
            activeOpacity={0.88}
          >
            <Text
              style={[
                styles.primaryBtnText,
                onRefreshStatus ? styles.primaryBtnTextActive : styles.primaryBtnTextDisabled,
              ]}
            >
              {onRefreshStatus ? 'Refresh hub verification status' : 'Waiting for hub confirmation'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

