/**
 * KudiIcon — Shared type definitions
 *
 * Both KudiIcon.web.tsx and KudiIcon.native.tsx import from here
 * so the public API stays identical across platforms.
 */

export type IconName =
  | 'arrow-left'
  | 'chevron-left'
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
  | 'bike'
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
  | 'alert-circle'
  | 'navigation'
  | 'power'
  | 'radar'
  | 'wallet'
  | 'star'
  | 'package'
  | 'camera'
  | 'crosshair'
  | 'eye'
  | 'eye-off'
  | 'search'
  | 'zap'
  | 'cloud-rain'
  | 'download'
  | 'arrow-right'
  | 'refresh'
  | 'refresh-cw';

export interface KudiIconProps {
  name: IconName;
  color?: string;
  size?: number;
}
