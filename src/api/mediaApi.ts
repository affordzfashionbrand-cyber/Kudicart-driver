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

export const ALLOWED_SUPPORT_MEDIA_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/3gpp',
  'video/x-m4v',
]);

export function resolveSupportUploadMimeType(fileName: string, mimeType?: string): string {
  const normalized = (mimeType || '').trim().toLowerCase();
  if (normalized && ALLOWED_SUPPORT_MEDIA_MIME_TYPES.has(normalized)) {
    return normalized;
  }
  const lowerName = (fileName || '').trim().toLowerCase();
  if (lowerName.endsWith('.mp4') || lowerName.endsWith('.m4v')) return 'video/mp4';
  if (lowerName.endsWith('.mov')) return 'video/quicktime';
  if (lowerName.endsWith('.webm')) return 'video/webm';
  if (lowerName.endsWith('.3gp')) return 'video/3gpp';
  return resolveUploadMimeType(fileName, mimeType);
}

export interface UploadedSupportAttachment {
  url: string;
  path?: string;
  name: string;
  mimeType: string;
  mediaType: 'image' | 'video';
  sizeBytes?: number;
}

export async function uploadSupportAttachment(
  localUri: string,
  fileName: string,
  mimeType?: string,
  sizeBytes?: number,
): Promise<UploadedSupportAttachment> {
  const resolvedMime = resolveSupportUploadMimeType(fileName, mimeType);
  if (!ALLOWED_SUPPORT_MEDIA_MIME_TYPES.has(resolvedMime)) {
    throw new Error(
      `Unsupported attachment format '${resolvedMime}'. Allowed: JPEG, PNG, WebP, PDF, MP4, MOV, WebM.`,
    );
  }
  const isVideo = resolvedMime.startsWith('video/');
  const maxBytes = isVideo ? 25 * 1024 * 1024 : 10 * 1024 * 1024;
  if (typeof sizeBytes === 'number' && sizeBytes > maxBytes) {
    throw new Error(`Attachment exceeds maximum ${isVideo ? '25MB video' : '10MB image'} limit.`);
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

  const uploaded = await request<any>('/api/v1/media/support-upload', {
    method: 'POST',
    body: formData as any,
  });
  if (!uploaded?.url) {
    throw new Error('Attachment upload succeeded without a remote URL.');
  }
  return {
    url: uploaded.url,
    path: uploaded.path,
    name: uploaded.name || fileName,
    mimeType: uploaded.mimeType || resolvedMime,
    mediaType: uploaded.mediaType || (isVideo ? 'video' : 'image'),
    sizeBytes: uploaded.sizeBytes ?? sizeBytes,
  };
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
