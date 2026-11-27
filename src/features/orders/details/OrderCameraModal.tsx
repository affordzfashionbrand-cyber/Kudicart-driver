import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { KudiIcon } from '../../../components/KudiIcon';
import { captureCameraFile } from '../../../utils/filePicker';
import { styles } from './orderDetails.styles';

export type CameraTarget = 'pickup' | 'delivery' | 'return' | 'handover';

interface OrderCameraModalProps {
  target: CameraTarget;
  onClose: () => void;
  onCapture: (photoUri?: string) => void;
}

export const OrderCameraModal: React.FC<OrderCameraModalProps> = ({
  target,
  onClose,
  onCapture,
}) => {
  const [captureError, setCaptureError] = useState<string | null>(null);

  const handleShutterPress = async () => {
    setCaptureError(null);
    const picked = await captureCameraFile('environment');
    if (picked?.uri) {
      onCapture(picked.uri);
      return;
    }
    if (Platform.OS === 'web') {
      onClose();
      return;
    }
    setCaptureError('Native camera capture requires a native camera module on this device build.');
  };

  return (
    <View style={styles.cameraContainer}>
      <SafeAreaView style={styles.cameraSafe}>
        {/* Header */}
        <View style={styles.cameraHeader}>
          <TouchableOpacity onPress={onClose} style={styles.cameraBackBtn}>
            <KudiIcon name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Instruction */}
        <View style={styles.cameraInstructionWrapper}>
          <View style={styles.cameraInstructionBadge}>
            <KudiIcon name="package" size={18} color="#FF5A1F" />
            <Text style={styles.cameraInstructionText}>
              {target === 'return'
                ? 'Take a clear picture of the return package'
                : target === 'handover'
                ? 'Take a clear picture of package handover'
                : 'Take a clear picture of the package'}
            </Text>
          </View>
        </View>

        {/* Viewfinder Mock */}
        <View style={styles.viewfinderCenter}>
          <View style={styles.viewfinderBox}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
        </View>

        {/* Capture Controls */}
        <View style={styles.cameraControls}>
          {captureError ? (
            <Text style={{ color: '#FCA5A5', marginBottom: 12, fontSize: 13, textAlign: 'center', paddingHorizontal: 20 }}>
              {captureError}
            </Text>
          ) : null}
          <TouchableOpacity style={styles.captureBtnOuter} onPress={handleShutterPress}>
            <View style={styles.captureBtnInner} />
          </TouchableOpacity>

          <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 24, fontSize: 14 }}>
            Tap shutter to capture package
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};
