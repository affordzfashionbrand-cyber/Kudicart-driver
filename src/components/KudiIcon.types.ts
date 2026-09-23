/**
 * KudiIcon — Shared type definitions
 *
 * Both KudiIcon.web.tsx and KudiIcon.native.tsx import from here
 * so the public API stays identical across platforms.
 */

export type IconName =
  | 'arrow-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'document'
  | 'upload'
  | 'trash'
  | 'close'
  | 'warning'
  | 'check-circle'
  | 'error-circle'
  | 'shield-cross'
  | 'phone'
  | 'lock'
  | 'help'
  | 'vehicle'
  | 'user'
  | 'home'
  | 'history'
  | 'notifications'
  | 'id-card'
  | 'shield'
  | 'check-badge'
  | 'edit'
  | 'check'
  | 'info-circle'
  | 'calendar'
  | 'clipboard'
  | 'clipboard-list'
  | 'clock'
  | 'headphones'
  | 'alert-circle';

export interface KudiIconProps {
  name: IconName;
  color?: string;
  size?: number;
}
