# KudiCart Driver App — Icon System Audit

## 1. Existing Icon Problems Identified
- **Overuse of Generic Layouts:** Previous document icons were wrapped in large colorful square boxes (`width: 48, height: 48, backgroundColor: '#F0F4FF'`), making the icons feel overly decorative rather than functional.
- **Inconsistent Emoji Usage:** System-level interactions (Dashboard cards, buttons, etc.) were utilizing unicode text symbols (`📋`, `🕒`, `👤`, `🎧`, `✓`) instead of standard UI glyphs.
- **Different Visual Weights:** A mix of filled, outlined, and text-based icons resulted in disparate visual density across the application.
- **Destructive/Action Icons:** Icons like `Remove` or `Upload` used heavy, unrefined generic symbols without cohesive design intent.

## 2. Selected Icon Family
- **Lucide Icons (`lucide-react` & `lucide-react-native`)**
- **Reasoning:** Lucide offers a modern, strictly outlined, highly professional enterprise icon set. It natively supports React Native via `react-native-svg` and works seamlessly on the Web (Vite). It avoids the need for heavy custom font files and guarantees 1:1 cross-platform parity. 

## 3. Icon Sizing System
- **14px / 16px (Small):** Inline metadata, status indicators, badges, trailing list elements (e.g., small checkmarks next to document names).
- **20px (Standard):** Row items, standard action buttons (e.g., Edit, Trash), and general list items.
- **24px (Medium):** Header navigation (Back, Close), Bottom Tab Navigation, Dashboard primary section headers.
- **32px+ (Large - Restricted):** Used exceptionally for empty states or major illustrations. Not used for standard list items.

## 4. Stroke System
- **Stroke Width:** `2px` strictly applied across all Lucide SVGs via the central `KudiIcon` component. 
- **Style:** Consistent rounded line caps and joints, purely outline-based. Filled variants are explicitly avoided for standard UI elements to maintain a lightweight, operational feel.

## 5. Semantic Color Use
- **Primary (`colors.primary` / `colors.primaryDark`):** Main actions, active bottom tabs, standard navigational icons.
- **Secondary (`colors.textSecondary` / `colors.textMuted`):** Inactive tabs, subtle empty state icons, metadata icons (calendars, phones).
- **Success (`colors.success`):** Completion checkmarks, active status dots. Used sparingly; not used as a dominant background color.
- **Warning / Danger (`colors.warning` / `colors.danger`):** Missing required documents, destructive actions (`Trash2`). Only the icon itself receives the semantic color, rather than a large background container.

## 6. Central Icon Abstraction
- The system enforces a singular `<KudiIcon name="..." size={...} color={...} />` API.
- **Cross-Platform Architecture:**
  - `KudiIcon.types.ts`: Defines the strict `IconName` literal type mapping.
  - `KudiIcon.d.ts`: Shared TypeScript definition.
  - `KudiIcon.web.tsx`: Resolves to DOM-based `<svg>` elements via `lucide-react`.
  - `KudiIcon.native.tsx`: Resolves to native SVGs via `lucide-react-native`.

## 7. Screens Audited & Components Updated
- **`DocumentUploadsScreen.tsx`**: Removed large colored boxes. Standardized the document icon and added a subtle green checkmark when complete.
- **`DocumentUploadDetailScreen.tsx`**: Removed the heavy background colors for empty and selected file states. Replaced standard text buttons with subtle `edit` and `trash` KudiIcons for file management.
- **`KycSubmissionScreen.tsx`**: Stripped background colors from `cardIconBox`, `docIconBoxSuccess`, and `docIconBoxPending`. Removed inline unicode `✓` symbols.
- **`DashboardScreen.tsx`**: Purged `📋`, `🕒`, `👤`, `🎧` emojis and replaced them with `clipboard`, `clock`, `user`, and `headphones` Lucide icons.
- **`MainNavigator.tsx`**: Replaced empty/default bottom tab text with properly sized Lucide icons (`home`, `clipboard-list`, `history`, `user`).

## 8. Intentional Exceptions
- None. The outline-only Lucide system and semantic coloring rules have been strictly applied globally. Graphic illustrations (if any) should use full Image assets rather than overriding the icon system.
