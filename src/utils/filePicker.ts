import { Platform } from 'react-native';
import { DocumentFile } from '../store/useDriverStore';

/**
 * A lightweight cross-platform file picker utility.
 * - On Web: Creates a hidden <input type="file"> to trigger the native browser file dialog.
 * - On Native: Safely mocks the selection since no native picker dependency is installed.
 */
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
    // Safely mock for native to prevent breaking without a native dependency
    return Promise.resolve({
      uri: 'file:///mock/path/to/mock_document.pdf',
      name: 'mock_document_' + Math.floor(Math.random() * 1000) + '.pdf',
      size: (Math.random() * 5).toFixed(1) + 'MB',
      type: 'application/pdf',
    });
  }
};
