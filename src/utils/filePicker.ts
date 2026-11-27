import { Platform } from 'react-native';
import { DocumentFile } from '../store/useDriverStore';

/**
 * A lightweight cross-platform file picker utility.
 * - On Web: Creates a hidden <input type="file"> to trigger the native browser file dialog.
 * - On Native: Safely mocks the selection since no native picker dependency is installed.
 */
export interface MediaPickerResult extends DocumentFile {
  mediaType: 'image' | 'video';
  sizeBytes: number;
}

export const pickSupportMedia = async (
  acceptKind: 'image' | 'video' | 'any' = 'any',
): Promise<MediaPickerResult | null> => {
  if (Platform.OS !== 'web') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept =
      acceptKind === 'image'
        ? 'image/jpeg,image/png,image/webp'
        : acceptKind === 'video'
          ? 'video/mp4,video/quicktime,video/webm,video/3gpp'
          : 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm,video/3gpp,application/pdf';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const uri = URL.createObjectURL(file);
      const mime = (file.type || '').toLowerCase();
      const isVideo = mime.startsWith('video/') || /\.(mp4|mov|webm|3gp|m4v)$/i.test(file.name || '');
      resolve({
        uri,
        name: file.name || (isVideo ? 'screen-recording.mp4' : 'screenshot.jpg'),
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: mime || (isVideo ? 'video/mp4' : 'image/jpeg'),
        mediaType: isVideo ? 'video' : 'image',
        sizeBytes: file.size || 0,
      });
    };
    input.style.display = 'none';
    document.body.appendChild(input);
    input.click();
    setTimeout(() => {
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
    }, 1000);
  });
};

export const pickFile = async (): Promise<DocumentFile | null> => {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,application/pdf';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const uri = URL.createObjectURL(file);
          resolve({
            uri,
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
            type: file.type,
          });
        } else {
          resolve(null);
        }
      };
      // For some browsers, we need to append the input to the body, click it, then remove it
      input.style.display = 'none';
      document.body.appendChild(input);
      input.click();
      
      // Cleanup after a short delay to allow file selection to happen
      setTimeout(() => {
        document.body.removeChild(input);
      }, 1000);
    });
  } else {
    // On Native without a third-party picker library, resolve null to prevent fabricated mock files
    return Promise.resolve(null);
  }
};

/**
 * A lightweight cross-platform camera capture utility via native device capture.
 * - On Web/Mobile Browser: Creates a hidden <input type="file" capture="..."> triggering native camera app.
 */
export const captureCameraFile = async (
  facingMode: 'user' | 'environment' = 'environment'
): Promise<DocumentFile | null> => {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.setAttribute('capture', facingMode);
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const uri = URL.createObjectURL(file);
          resolve({
            uri,
            name: file.name || (facingMode === 'user' ? 'selfie.jpg' : 'document.jpg'),
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
            type: file.type || 'image/jpeg',
          });
        } else {
          resolve(null);
        }
      };
      input.style.display = 'none';
      document.body.appendChild(input);
      input.click();

      setTimeout(() => {
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      }, 1000);
    });
  } else {
    return Promise.resolve(null);
  }
};
