import { request } from './client';

export const ALLOWED_MEDIA_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export function resolveUploadMimeType(fileName: string, mimeType?: string): string {
  const normalized = (mimeType || '').trim().toLowerCase();
  if (normalized && ALLOWED_MEDIA_MIME_TYPES.has(normalized)) {
    return normalized;
  }
  const lowerName = (fileName || '').trim().toLowerCase();
  if (lowerName.endsWith('.pdf')) {
    return 'application/pdf';
  }
  if (lowerName.endsWith('.png')) {
    return 'image/png';
  }
  if (lowerName.endsWith('.webp')) {
    return 'image/webp';
  }
  return 'image/jpeg';
}

export function isLocalFileUri(uri?: string | null): boolean {
  if (!uri || typeof uri !== 'string') {
    return false;
  }
  return /^(blob:|file:|content:|data:)/i.test(uri.trim());
}

export async function uploadMediaFile(
  localUri: string,
  fileName: string,
  mimeType?: string,
): Promise<string> {
  const resolvedMime = resolveUploadMimeType(fileName, mimeType);
  if (!ALLOWED_MEDIA_MIME_TYPES.has(resolvedMime)) {
    throw new Error(`Unsupported file type '${resolvedMime}'. Allowed: JPEG, PNG, WEBP, PDF.`);
  }

  const formData = new FormData();
  if (/^(blob:|data:)/i.test(localUri.trim()) && typeof fetch === 'function') {
    const res = await fetch(localUri);
    const blob = await res.blob();
    const finalBlob =
      blob.type === resolvedMime ? blob : blob.slice(0, blob.size, resolvedMime);
    formData.append('file', finalBlob as any, fileName);
  } else {
    formData.append('file', {
      uri: localUri,
      name: fileName,
      type: resolvedMime,
    } as any);
  }

  const uploaded = await request<{ success?: boolean; url?: string; data?: { url?: string } }>(
    '/api/v1/media/upload',
    {
      method: 'POST',
      body: formData as any,
    },
  );
  const resolvedUrl = uploaded?.url || uploaded?.data?.url;
  if (!resolvedUrl) {
    throw new Error('Media upload succeeded without a remote URL.');
  }
  return resolvedUrl;
}
