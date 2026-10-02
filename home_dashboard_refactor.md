# KudiCart Driver App — Home Dashboard Refactor Plan

## 1. Current Home Problems
The previous iteration of the Dashboard simply removed redundant navigation cards (Assigned Orders, History, Profile) and left the screen feeling sparse and structurally incomplete. The Availability control was a passive switch, and the active assignment card was visually disconnected from the driver's overall operational state. It did not feel like a unified "Control Center".

## 2. Home's Single Responsibility
The Home screen is the **Operational Control Center**. It must immediately answer:
- Who am I?
- Am I available?
- Do I have an assignment?
- What is my current delivery phase?
- What do I need to do right now?

## 3. Target Information Hierarchy
1. **Header:** Minimal KudiCart branding + Profile/Notification access.
2. **Identity & Status Bar:** Driver greeting, ID, and current availability status (prominently integrated, not a separate passive card).
3. **Operational Context (The Hub):** A dynamic central area that changes entirely based on the state (Offline, Searching, Active Delivery).
4. **Primary CTA:** A single, unmistakable button driving the next required action (e.g., "Go Online", "Review Assignment", "Continue Delivery").

## 4. States Supported
The Dashboard will natively render these exact operational states without navigating to different screens:
- **OFFLINE:** Displays a clear "Offline" message. The primary CTA is a massive "Go Online" button.
- **ONLINE (No Order):** Displays a "Ready for deliveries" state. Secondary CTA allows going offline.
- **ASSIGNED (Not Accepted):** Highlights the new order with critical context (Pickup, Distance). Primary CTA is "Review Assignment".
- **ACCEPTED / PICKED_UP / OUT_FOR_DELIVERY:** Highlights the current delivery phase. Primary CTA is "Continue Delivery".

## 5. What Is Intentionally Removed
- The "Operational Desk" grid and its redundant navigation cards.
- The passive, easily ignorable Availability Switch card (replaced with deliberate state-driven CTAs).
- Disconnected "Empty State" placeholder boxes that just fill space.

## 6. What Is Retained
- The KudiCart design system (typography, spacing, colors, KudiIcon).
- Zustand state integration (`useDriverStore`, `useOrderStore`).
- The existing bottom navigation.

## 7. What Is Newly Presented
- A cohesive, state-driven "Operational Hub" layout.
- Contextual primary CTAs that dominate the screen hierarchy and drive the driver's workflow.
- Clearer visual distinction between "Offline", "Ready", and "Active" states.

## 8. What Information Is Intentionally NOT Shown
- Full order details (e.g., item lists, customer phone numbers) — this remains progressively disclosed in `OrderDetailsScreen`.
- UI-only "Partner Support" or generic shortcuts.
- Decorative illustrations that don't serve an operational purpose.

## 9. Why Each Major UI Element Exists
- **Top Nav:** Quick access to global alerts and profile editing.
- **Status Bar:** Anchors the driver's identity and current shift status.
- **The Operational Hub:** Ensures the driver's attention is entirely focused on their immediate physical reality (waiting vs. driving).
- **Primary CTA:** Eliminates choice paralysis. There is only ever one correct next step.
