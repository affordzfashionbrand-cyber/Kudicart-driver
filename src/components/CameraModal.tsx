import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { KudiIcon } from './KudiIcon';
import { colors } from '../theme/colors';
import { DocumentFile } from '../store/useDriverStore';
import { pickFile } from '../utils/filePicker';

export interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: DocumentFile) => void;
  mode: 'document' | 'selfie';
  title?: string;
  side?: 'front' | 'back';
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  mode,
  title,
  side,
}) => {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    mode === 'selfie' ? 'user' : 'environment'
  );
  const [isInitializing, setIsInitializing] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<DocumentFile | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera tracks cleanly
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
  };

  // Start camera stream when modal is opened
  useEffect(() => {
    if (!isOpen) {
      stopStream();
      setCapturedUri(null);
      setCapturedFile(null);
      setCameraError(null);
      return;
    }

    let isCancelled = false;

    const startCamera = async () => {
      setIsInitializing(true);
      setCameraError(null);
      stopStream();

      if (Platform.OS !== 'web') {
        setIsInitializing(false);
        setCameraError('Live camera viewfinder is currently supported on web browsers.');
        return;
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        setIsInitializing(false);
        setCameraError('Camera API is not supported by your browser.');
        return;
      }

      try {
        // Enumerate devices to check if both front and back cameras exist
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter((d) => d.kind === 'videoinput');
          if (!isCancelled) {
            setHasMultipleCameras(videoDevices.length > 1);
          }
        } catch {
          // Non-critical, ignore
        }

        const constraints: MediaStreamConstraints = {
          audio: false,
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: mode === 'selfie' ? 1080 : 1920 },
            height: { ideal: mode === 'selfie' ? 1080 : 1080 },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {
            // Auto-play was blocked or failed
          });
        }
        setIsInitializing(false);
      } catch (err: any) {
        if (!isCancelled) {
          setIsInitializing(false);
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setCameraError('Camera permission was denied. Please allow camera access in your browser settings.');
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setCameraError('No camera device found on this system.');
          } else {
            setCameraError(err?.message || 'Unable to start camera stream.');
          }
        }
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      stopStream();
    };
  }, [isOpen, facingMode, mode]);

  // Flip between front and rear cameras
  const handleToggleCamera = () => {
    if (isInitializing) return;
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture the photo from the video feed
  const handleSnap = () => {
    if (!videoRef.current || isInitializing) return;

    try {
      const video = videoRef.current;
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // If user-facing selfie, mirror horizontally so captured photo looks natural
      if (facingMode === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          const uri = URL.createObjectURL(blob);
          const defaultName =
            mode === 'selfie'
              ? 'selfie.jpg'
              : `${side ? side + '_' : ''}document.jpg`;
          const sizeMb = (blob.size / 1024 / 1024).toFixed(2) + ' MB';

          const file: DocumentFile = {
            uri,
            name: defaultName,
            size: sizeMb,
            type: 'image/jpeg',
          };

          setCapturedUri(uri);
          setCapturedFile(file);
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      // Capture error
    }
  };

  // Retake photo: discard current snapshot and resume stream
  const handleRetake = () => {
    setCapturedUri(null);
    setCapturedFile(null);
    if (videoRef.current && streamRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Confirm photo: pass to caller and close
  const handleConfirm = () => {
    if (capturedFile) {
      stopStream();
      onCapture(capturedFile);
      onClose();
    }
  };

  // Fallback to file picker
  const handleChooseFile = async () => {
    stopStream();
    onClose();
    const file = await pickFile();
    if (file) {
      onCapture(file);
    }
  };

  if (!isOpen) return null;

  const displayTitle =
    title || (mode === 'selfie' ? 'Take Driver Selfie' : 'Capture Document Photo');

  return (
    <View style={styles.overlayContainer}>
      <View style={styles.modalBackdrop}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              stopStream();
              onClose();
            }}
            accessibilityLabel="Close camera"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <KudiIcon name="close" size={24} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.titleWrap}>
            <Text style={styles.headerTitle}>{displayTitle}</Text>
            <Text style={styles.headerSub}>
              {mode === 'selfie'
                ? 'Align face within the circle'
                : 'Position document within the frame'}
            </Text>
          </View>

          {hasMultipleCameras && !capturedUri ? (
            <TouchableOpacity
              style={styles.flipButton}
              onPress={handleToggleCamera}
              accessibilityLabel="Switch camera"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <KudiIcon name="refresh-cw" size={22} color={colors.white} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {/* Viewfinder Center Area */}
        <View style={styles.viewfinderContainer}>
          {cameraError ? (
            <View style={styles.errorContainer}>
              <View style={styles.errorIconCircle}>
                <KudiIcon name="warning" size={32} color={colors.danger} />
              </View>
              <Text style={styles.errorTitle}>Camera Not Available</Text>
              <Text style={styles.errorDesc}>{cameraError}</Text>
              <TouchableOpacity
                style={styles.errorActionButton}
                onPress={handleChooseFile}
                activeOpacity={0.8}
              >
                <KudiIcon name="upload" size={18} color={colors.white} />
                <Text style={styles.errorActionText}>Upload from Files instead</Text>
              </TouchableOpacity>
            </View>
          ) : capturedUri ? (
            // Review Captured Image View
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: capturedUri }}
                style={styles.capturedImage}
                resizeMode="contain"
              />
            </View>
          ) : (
            // Live Stream Viewfinder
            <View style={styles.streamWrapper}>
              {Platform.OS === 'web' && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                  }}
                />
              )}

              {isInitializing && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Starting camera...</Text>
                </View>
              )}

              {/* Target Guides */}
              {!isInitializing && (
                <View style={styles.overlayGuideWrapper} pointerEvents="none">
                  {mode === 'selfie' ? (
                    <View style={styles.selfieOvalGuide} />
                  ) : (
                    <View style={styles.documentFrameGuide}>
                      <View style={[styles.cornerMarker, styles.cornerTL]} />
                      <View style={[styles.cornerMarker, styles.cornerTR]} />
                      <View style={[styles.cornerMarker, styles.cornerBL]} />
                      <View style={[styles.cornerMarker, styles.cornerBR]} />
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          {cameraError ? (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                stopStream();
                onClose();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          ) : capturedUri ? (
            // Review Actions: Retake vs Use Photo
            <View style={styles.reviewActionsRow}>
              <TouchableOpacity
                style={styles.retakeActionButton}
                onPress={handleRetake}
                activeOpacity={0.8}
              >
                <KudiIcon name="refresh-cw" size={18} color={colors.white} />
                <Text style={styles.retakeActionText}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmActionButton}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <KudiIcon name="check" size={20} color={colors.white} />
                <Text style={styles.confirmActionText}>Use Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Live Capture Shutter Control
            <View style={styles.captureControlsCol}>
              <View style={styles.shutterRow}>
                <TouchableOpacity
                  style={styles.shutterOuter}
                  onPress={handleSnap}
                  disabled={isInitializing}
                  activeOpacity={0.7}
                  accessibilityLabel="Snap photo"
                >
                  <View style={styles.shutterInner} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.chooseFileLink}
                onPress={handleChooseFile}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.chooseFileLinkText}>Or choose from device files</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    elevation: 99999,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topBar: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 2,
  },

  viewfinderContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    zIndex: 5,
  },
  loadingText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },

  overlayGuideWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  selfieOvalGuide: {
    width: 250,
    height: 320,
    borderRadius: 160,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  documentFrameGuide: {
    width: '88%',
    maxWidth: 420,
    aspectRatio: 1.58,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 12,
    position: 'relative',
  },
  cornerMarker: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: colors.primary,
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },

  previewContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },

  errorContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    maxWidth: 380,
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(218, 30, 40, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
  },
  errorDesc: {
    fontSize: 13,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  errorActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  errorActionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  bottomBar: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    zIndex: 10,
  },
  captureControlsCol: {
    alignItems: 'center',
    gap: 12,
  },
  shutterRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: colors.white,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
  },
  chooseFileLink: {
    paddingVertical: 4,
  },
  chooseFileLinkText: {
    color: '#B0B0B0',
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  reviewActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 360,
    justifyContent: 'center',
  },
  retakeActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  retakeActionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  confirmActionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },

  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
