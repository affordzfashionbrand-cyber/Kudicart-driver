# KudiCart Driver App — Open Questions

This document tracks unresolved business details and edge cases that affect the UI/UX but cannot be solved by design alone.

## Blocking For Design
*(None of the current questions strictly block layout creation, as realistic placeholders can be used, but they must be answered before final implementation.)*

## Non-Blocking For Design
- **Exact Daily Incentive Cap:** The policy mentions an applicable daily incentive cap but does not specify the ₹ amount.
- **Shift / Slot Timings:** What are the exact hours for Full-Time (8 hours) vs Part-Time (5 hours)? Does the driver pick the shift, or is it fixed?
- **Notification Events:** What exact events trigger push notifications (e.g., "New Assignment", "Shift Starting Soon", "Bonus Achieved")?
- **Exception Handling Flows:** How should the UI handle failure states during delivery?
  - Customer unavailable / not answering phone.
  - Package damaged during transit.
  - Vendor gave the wrong package.
  - Does the driver mark "Failed Delivery", or do they call Support?
- **Background Location Tracking:** The design assumes location tracking is only active during the `OUT_FOR_DELIVERY` state. If continuous tracking is required while simply `ONLINE`, OS-level background location permissions and persistent notification UI will be required.
- **Network Resilience:** The design assumes standard online connectivity. If offline caching (e.g., confirming delivery while in a dead zone) is required, the UI will need syncing indicators.
