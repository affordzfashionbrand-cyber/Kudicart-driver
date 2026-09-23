/**
 * KudiIcon — Web implementation
 *
 * Uses lucide-react which renders standard <svg> elements.
 * Loaded by Vite via .web.tsx extension resolution.
 * Metro (Android) will never touch this file.
 */
import React from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Smartphone,
  Lock,
  HelpCircle,
  Shield,
  IdCard,
  Edit2,
  Bike,
  User,
  Home,
  Clock,
  Bell,
  Check,
  Info,
  Calendar,
  Clipboard,
  ClipboardList,
  Headphones,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';
import { IconName, KudiIconProps } from './KudiIcon.types';

const iconMap: Record<IconName, LucideIcon> = {
  'arrow-left': ArrowLeft,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'document': FileText,
  'upload': Upload,
  'trash': X,
  'close': X,
  'warning': AlertTriangle,
  'check-circle': CheckCircle2,
  'error-circle': XCircle,
  'shield-cross': ShieldAlert,
  'phone': Smartphone,
  'lock': Lock,
  'help': HelpCircle,
  'vehicle': Bike,
  'user': User,
  'home': Home,
  'history': Clock,
  'notifications': Bell,
  'id-card': IdCard,
  'shield': Shield,
  'check-badge': CheckCircle2,
  'edit': Edit2,
  'check': Check,
  'info-circle': Info,
  'calendar': Calendar,
  'clipboard': Clipboard,
  'clipboard-list': ClipboardList,
  'clock': Clock,
  'headphones': Headphones,
  'alert-circle': AlertCircle,
};

export type { IconName, KudiIconProps };

export const KudiIcon: React.FC<KudiIconProps> = ({ name, color = '#1A2C5B', size = 24 }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`[KudiIcon] Missing icon: ${name}`);
    return null;
  }

  return <IconComponent color={color} size={size} strokeWidth={2} />;
};
