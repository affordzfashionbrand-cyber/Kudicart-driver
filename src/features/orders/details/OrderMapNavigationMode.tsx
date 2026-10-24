import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Order } from '../../../store/useOrderStore';
import { KudiIcon } from '../../../components/KudiIcon';
import { LiveRouteMap, LiveRouteMapRef } from '../LiveRouteMap';

interface OrderMapNavigationModeProps {
  order: Order;
  mapRef: React.RefObject<LiveRouteMapRef>;
  fullScreenMap: boolean;
  setFullScreenMap: (val: boolean) => void;
  onBack: () => void;
  isReturning: boolean;
  theme: any;
  onMarkArrived: () => void;
  hubCoordinates: { latitude: number; longitude: number };
  destCoordinates: { latitude: number; longitude: number };
}

export const OrderMapNavigationMode: React.FC<OrderMapNavigationModeProps> = ({
  order,
  mapRef,
  fullScreenMap,
  setFullScreenMap,
  onBack,
  isReturning,
  theme,
  onMarkArrived,
  hubCoordinates,
  destCoordinates,
}) => {
  return (
    <View style={{ flex: 1, backgroundColor: theme.canvas }}>
      {/* MAP BACKGROUND */}
      <View style={[StyleSheet.absoluteFillObject, !fullScreenMap && { bottom: 215 }]}>
        <LiveRouteMap
          ref={mapRef}
          origin={hubCoordinates}
          destination={destCoordinates}
          originLabel={order.pickupLocation}
          destinationLabel={order.customerAddress}
          isFullScreen={fullScreenMap}
        />
      </View>

      {/* TOP FLOATING BACK BUTTON */}
      <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'box-none' }}>
        <View style={{ padding: 16 }}>
          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2DED7',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={onBack}
            accessibilityLabel="Back"
          >
            <KudiIcon name="arrow-left" size={22} color="#171716" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* FLOATING MAP CONTROLS */}
      <View style={{ position: 'absolute', right: 14, bottom: fullScreenMap ? 32 : 234, zIndex: 10, gap: 10 }}>
        {!fullScreenMap && (
          <TouchableOpacity
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: '#FF5A1F',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.16,
              shadowRadius: 4,
              elevation: 4,
            }}
            onPress={() => setFullScreenMap(true)}
            accessibilityLabel="Expand map"
          >
            <KudiIcon name="navigation" size={20} color="#171716" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E2DED7',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={() => mapRef.current?.recenter()}
          accessibilityLabel="Recenter map"
        >
          <KudiIcon name="crosshair" size={20} color="#171716" />
        </TouchableOpacity>
      </View>

      {/* BOTTOM SHEET OVERLAY */}
      {!fullScreenMap && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: '#E2DED7',
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 36 : 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          {/* Sheet Handle */}
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#E2DED7' }} />
          </View>

          {/* Title: Sentence Case */}
          <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', color: '#171716', marginBottom: 16 }}>
            {isReturning ? 'Returning to store' : 'On the way'}
          </Text>

          {/* Destination Address & Customer */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: '#FFF0E8',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                marginTop: 2,
              }}
            >
              <KudiIcon name={isReturning ? 'home' : 'navigation'} size={18} color="#FF5A1F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#171716', lineHeight: 22 }}>
                {isReturning ? order.pickupLocation : order.customerAddress}
              </Text>
              <Text style={{ fontSize: 13, color: '#65635F', marginTop: 4 }}>
                {isReturning
                  ? order.isTryAndBuy && order.returnManifestId
                    ? `Return Bay • Manifest ${order.returnManifestId}`
                    : 'Store location'
                  : order.customerName}
              </Text>
            </View>
          </View>

          {/* Primary Action Button: Signal Orange #FF5A1F + Charcoal Text #171716 */}
          <TouchableOpacity
            style={{
              backgroundColor: '#FF5A1F',
              height: 50,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={onMarkArrived}
          >
            <Text style={{ color: '#171716', fontSize: 15, fontWeight: '700' }}>
              {isReturning ? 'Mark arrived at store' : 'Mark Arrived'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
