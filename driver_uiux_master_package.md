# KudiCart Driver App — Master UI/UX Design Package

## 1. Product Context
- **Product purpose:** A dedicated mobile application for Delivery Partners to manage their shift, receive orders, and execute deliveries.
- **Target users:** Delivery Partners working either full-time or part-time.
- **Driver role:** The driver is the operational executor. They do not accept/reject orders, nor do they find orders in a marketplace.
- **Application position:** A presentation and execution layer. All business logic, assignment decisions, and ledger management live on the backend.
- **Current technology context:** Built with React Native and TypeScript.
- **Current development state:** The app is functional but has poor information architecture, redundant card components, and workflow UX that doesn't perfectly align with the latest business reality.

## 2. Product / Business Context
- **Delivery partner model:** Stationed at a specific store.
- **Manual/admin-driven assignment:** Admin manually assigns orders to the driver. The driver does not browse or claim orders.
- **Driver operational context:** On the move, time-sensitive, working under varying lighting conditions, often needing to scan information quickly.
- **Full-Time / Part-Time model:** Two employment types exist with different hour commitments, volume expectations, and bonus thresholds.
- **Relevant earnings/incentive rules:** Includes base payout, daily performance incentive, peak-hour incentive, weekly attendance/performance bonus, and tips.
- **Important business constraints:** Do not invent missing logic like wallets or chat. Do not add marketplace/auto-dispatch features.

## 3. Current Application Audit
- **Current screen inventory:** Splash, Phone Login, OTP Verification, Driver Details (KYC), Vehicle Details (KYC), Document Uploads, Selfie Capture, Verification Pending, Verification Approved/Rejected, Home (Dashboard), Order Details, Earnings, Shifts, Profile, Order History, Notifications.
- **Current UI/UX problems:** Overly complex dashboard resembling an admin tool or card wall. Too many swipeable cards hiding important information.
- **Major inconsistencies:** The UX implies a marketplace (radar animations for "waiting") while the business reality is admin-assigned.
- **Repetition:** Deep order details (like package lists) are duplicated across both Pickup and Delivery states without progressive disclosure.
- **Missing UX:** True empty resting states for Offline, and clear navigation intents for routing.
- **State problems:** Lack of absolute visual clarity between Online, Waiting, and Active assignment.
- **Navigation duplication:** Dashboard cards duplicate bottom tab navigation (e.g., Profile, Shifts).
- **Responsiveness issues:** Hardcoded heights on some cards cause issues on smaller screens.
- **Accessibility issues:** Low contrast text on some badges, state changes relying solely on color rather than text+icon+color.

## 4. Global UX Principles
- **One screen = one primary job.**
- **One primary action per state.**
- **Avoid duplicated information:** Use progressive disclosure based on context.
- **Home is operational overview:** It should highlight the immediate next action and current state, not historical or deep policy data.
- **Do not use cards to compensate for weak hierarchy:** If information can be grouped cleanly with typography and spacing, do so.
- **Do not invent business rules:** Stick strictly to provided policies.
- **Do not create unnecessary screens:** Combine where logical (e.g., waiting and active states occur on Home).

## 5. Information Architecture
- **Application-level navigation:** Bottom tab bar with Home, Earnings, Shifts, Profile.
- **Screen responsibilities:** Home (Status/Assignment), Earnings (Financial), Shifts (Schedule), Profile (Identity/Settings).
- **Information ownership:** Complex data (e.g., weekly bonus progress) lives in Earnings, not Home.
- **Progressive disclosure:** Only show what is needed for the exact current workflow step.
- **Primary vs secondary information:** Primary information must be immediately readable at a glance (Status, Next Step, Next Address).

## 6. Complete Screen Matrix
| Screen | Purpose | Driver Task | Required Content | Primary Action | Secondary Actions | States | Existing Issues | Target UX | Duplication Concerns | Missing Functionality |
|---|---|---|---|---|---|---|---|---|---|---|
| **Home** | Operational hub | Check state, view assignment | Driver identity, availability toggle, shift progress, active order summary | Go Online / Go Offline | View Earnings | Offline, Waiting, Active | Fake radar, redundant banners | Focused state hierarchy | Duplicated order lists | Clean "Waiting" state |
| **Order Details (Assigned)** | Verify pickup | Verify package and confirm | Order ID, Package list | Confirm Pickup | Call Store | Assigned (At Store) | Shows map before pickup | Clean checklist, camera proof | Customer address shown prematurely | N/A |
| **Order Details (Out for Delivery)** | Deliver package | Navigate to customer | Delivery Address, Customer Name/Contact, Order ID | Mark Delivered | Call Customer, Navigate | Out for Delivery | Heavy UI, full map overlay | Map-centric/routing view | Full item list shown unnecessarily | One-tap navigation |
| **Earnings** | Track finances | View progress/payouts | Daily earnings, Weekly bonus progress | N/A | View History | Full-Time, Part-Time | Hidden in Home cards | Dedicated breakdown screen | N/A | Policy breakdown details |
| **Profile** | View identity | Check status | Name, ID, Role, Vehicle, Docs | Edit Profile | Logout | Approved, Pending | Mixed with KYC status | Clean personal info list | N/A | N/A |
| **KYC Flow** | Onboarding | Enter details | Full Name, Aadhaar, PAN, DOB, Licence, Role | Continue / Submit | N/A | Input, Error, Uploading | Basic forms, bulky layout | Step-by-step progressive form | N/A | Real-time validation |

## 7. Content Ownership Matrix
| Data Element | Primary Location | Contextual Locations | Should Not Be Repeated On | Notes |
|---|---|---|---|---|
| **Driver Name & Role** | Profile | Home (Header) | Order Screens, KYC | Keep compact on Home. |
| **Employment Type** | Profile | Home (Header), Earnings | Order Screens | Dictates bonus thresholds. |
| **Earnings / Bonus Details** | Earnings | Home (Summary only) | Profile, Order Screens | Don't put the full policy on Home. |
| **Active Order ID / Status** | Order Details (Active) | Home (Active Card) | Profile, Earnings | Only visible during active order. |
| **Package Item List** | Order Details (Pickup) | None | Home, Out for Delivery | Driver only verifies at pickup. |
| **Customer Name & Address** | Order Details (Delivery) | None | Home, Pickup | Only needed *after* pickup. |
| **Store Address** | Store Details | Home (Offline) | Out for Delivery | Driver is based at the store. |

## 8. State & Workflow Definitions
- **Authentication:** Driver needs to authenticate. Context: Logged out. Visible: Phone, OTP. Action: Send/Verify. Transition: On success → KYC or Home.
- **KYC:** Driver must provide details. Visible: Sequential forms (Personal, Vehicle, Docs). Action: Submit. Transition: To Verification Pending.
- **Verification (Pending):** Admin reviewing docs. Visible: Pending graphic. Action: None (wait). Transition: Admin approves/rejects.
- **Home (Offline):** Driver is off shift. Visible: "You are offline", Store context. Action: Go Online. Transition: Status toggle. Changes: UI shifts to waiting.
- **Home (Waiting):** Ready for assignment. Visible: "Waiting for orders", Shift progress. Action: Go Offline. Transition: Order assigned. Changes: Active assignment card appears.
- **Assignment / Pickup:** Order assigned, verify items. Visible: Item list, Order ID. Action: Camera Proof / Confirm Pickup. Transition: Package verified. Changes: Moves to Out for Delivery.
- **Out for Delivery:** Navigating to customer. Visible: Customer Address, Navigation CTA. Action: Mark Delivered. Transition: Package delivered. Changes: Returns to Waiting.
- **History / Notifications / Profile:** Passive screens for information retrieval.

## 9. Full-Time / Part-Time UX
- **One Shared Application:** Both roles use the exact same app and Home experience.
- **Differences Supported:**
  - **Full-Time:** 8 hours/day, 6 days/week, 119 eligible weekly orders, ₹1,100 weekly bonus.
  - **Part-Time:** 5 hours/day, 6 days/week, 75 eligible weekly orders, ₹500 weekly bonus.
- **UX Adaptation:** Progress bars in the Earnings screen adjust their max values based on the role. The Home summary indicates the current role explicitly.

## 10. Home Dashboard UX
- **Purpose:** An operational dashboard for the immediate shift.
- **Hierarchy:** Driver Status (Top) → Active Assignment (Middle - if active) → Shift/Earnings Summary (Bottom).
- **States:**
  - **Offline context:** Calm, clear resting state.
  - **Waiting state:** Clean "Waiting" text. No fake radars or scanning animations.
  - **Assignment state:** Dominant, un-ignorable card or overlay requiring action.
- **Do Not Duplicate:** Deep order details, full earnings policies, profile settings, or navigation grids.

## 11. Delivery Workflow UX
**Latest Intended Operational Model:**
Driver At Store → Order Assigned → Review Order → Confirm Pickup → Out For Delivery → Navigate To Customer → Confirm Delivery → Delivered.

**Requirement Conflicts & Resolutions:**
- *Conflict:* Older docs mention "Accept Order" and "Navigate to Pickup".
- *Reality:* Driver is at the store. Assignments are mandatory.
- *Resolution:* Removed "Accept" and "Navigate to Pickup". Flow goes directly to "Review Order & Confirm Pickup".

## 12. KYC / Onboarding UX
- Step 1: Driver Details (Name, DOB, Role).
- Step 2: Vehicle Details.
- Step 3: Documents (Aadhaar, PAN, DL).
- Step 4: Selfie.
- Step 5: Verification Pending (Waiting state).
- Step 6: Approved (Transition to Home) OR Rejected (Review & Resubmit with clear inline feedback).

## 13. Profile UX
- **Driver identity:** Photo, Name, ID.
- **Personal Information:** Address, Contact.
- **Employment Type:** Full-time or Part-time display.
- **Documents & Verification:** Read-only view of approved documents.
- **Vehicle Information:** Read-only view of registered vehicle.
- **Avoiding Duplication:** Do not show the editable KYC submission forms once approved.

## 14. Notifications UX
- **Notification List:** Simple, chronological list of alerts.
- **Relevant events:** Assignments, System alerts, Shift reminders.
- **States:** Unread vs Read (bold vs normal text). Empty state with appropriate graphic.
- **Relationship with Home:** Accessible via a bell icon in the top corner.

## 15. Global Design System
- **Layout / Spacing:** 4px baseline grid (8, 16, 24, 32). 16px or 20px screen margins.
- **Typography Hierarchy:** Clean sans-serif. Hero (32px+), H1 (24px), H2 (18px), Body (16px), Caption (12px).
- **Surfaces & Cards:** Flat design with subtle borders (1px). Avoid heavy drop shadows.
- **Buttons:** 56px height, full-width for primary actions. Pill or 16px radius.
- **Status Indicators:** Color-coded (Lime for Online/Success, Grey for Offline, Red for Error).
- **Empty / Waiting States:** Centered, subdued icon, clear text. No decorative overload.
- **Iconography:** Outline style, 2px stroke. Used only for clarity.

## 16. Responsive UX Rules
- **Behavior (320px - 430px+):** Fluid width, no horizontal scrolling for text.
- **Long text/addresses:** Truncate with ellipsis if secondary, wrap to multiple lines if primary.
- **CTA behavior:** Primary buttons should be sticky at the bottom, above the safe area/keyboard.
- **Scrolling / Density:** Scroll containers for variable-height content. Maintain touch target sizes on small screens.

## 17. Accessibility Rules
- **Touch targets:** Minimum 48x48dp.
- **Contrast:** WCAG AA compliance for primary text and state colors.
- **State communication:** Never use color alone. Use Text + Icon + Color (e.g., a green circle AND the text "Online").
- **Form labels:** Always use visible labels above inputs, not just placeholders.

## 18. Current → Target Change Register
- **Dashboard Radar Animation** → Clean "Waiting" text. Reason: Radar implies geographical searching, which violates the "Admin Assigned Only" rule.
- **Accept Order Button** → Removed. Reason: Assignments are mandatory.
- **Navigate to Pickup Action** → Removed. Reason: Driver is already at the store.
- **Swipeable Bonus Cards on Home** → Moved to Earnings screen. Reason: Hides important details in a swipe gesture; clutters operational focus.
- **Promo Banners on Home** → Removed. Reason: Distracts from immediate operational state.
- **Profile & KYC Mixed** → Separated. Reason: Approved drivers only need a read-only profile, not submission forms.

## 19. Explicit Removals
- **"Accept Order" Button:** Removed. Driver is assigned automatically.
- **"Navigate to Pickup" Action:** Removed. Driver is stationed at the store.
- **Radar Animation:** Removed. Driver does not search for orders.
- **Marketing/Promo Banners:** Removed. Driver app is a strict operational tool.
- **Dashboard Navigation Card Grid:** Removed. Handled by the bottom tab bar.

## 20. Approved Additions
- **Improved Empty States:** For offline and waiting states, and empty notification lists.
- **Clearer State Indicators:** Distinct visual changes between Offline, Online, and Active Assignment.
- **Progress Visualization:** Clearer progress bars for weekly bonuses on the Earnings screen.
- **Contextual Helper Text:** For complex forms in KYC.

## 21. Requirement Conflicts / Assumptions
- **Conflict:** Older docs vs implementation vs latest reality regarding Order Acceptance and Pickup Navigation.
- **Resolution:** The latest clarification overrides the old flow. The application MUST use the store-based, mandatory assignment workflow.
- **Assumption:** The driver's location is tracked in the background primarily during active delivery, but we assume network connectivity is stable for standard state updates.

## 22. Open Design Dependencies
- See `driver_uiux_open_questions.md` for unresolved exact values (incentive caps, exact notification triggers, error handling logic).
