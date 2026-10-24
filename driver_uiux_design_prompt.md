# KudiCart Driver App — Universal Design Prompt

**Instructions for the Design Tool:**
You are a senior product designer tasked with creating a complete, high-fidelity UI/UX redesign for a React Native mobile application called the "KudiCart Driver App". Use the provided screenshots to understand the current content, states, and problems, but **DO NOT** copy the existing layout simply because it exists. Reimagine the interface completely based on the instructions below.

---

## 1. Product Context & Purpose
The KudiCart Driver App is an operational tool for delivery partners. It is a strict execution layer—all assignments, business logic, and ledger management are handled by the admin backend.

## 2. Target User & Operational Environment
- **Target User:** Delivery Partners (working either Full-Time or Part-Time).
- **Environment:** Drivers use this app on the go, often with one hand, outdoors in sunlight, and under operational time pressure.
- **UX Goal:** The design must prioritize scanability, clear touch ergonomics, absolute state awareness, and progressive disclosure. Drivers need clear next actions, not unnecessary screens.

## 3. The Catch (Business Reality)
- Drivers do **NOT** browse a marketplace of orders. 
- Drivers do **NOT** accept or reject orders.
- Drivers are **stationed at a store**. 
- Admin manually assigns an order to them, and they **MUST** deliver it.

## 4. Full-Time / Part-Time Context
There is **one shared application** and one shared Home experience. The employment type changes specific targets (e.g., weekly bonuses and shift hours), which should be reflected contextually, but do not create two separate apps.
- **Full-Time:** 8 hours/day, 119 eligible weekly orders, ₹1,100 weekly bonus.
- **Part-Time:** 5 hours/day, 75 eligible weekly orders, ₹500 weekly bonus.

## 5. Current Application Problems
The current UI suffers from:
- **Card Walls:** Excessive, redundant cards on the Home screen that act like an admin dashboard.
- **Fake Marketplaces:** Radar animations that imply the app is searching for orders (which is false).
- **Repetitive Info:** Showing full customer addresses during pickup, and full package contents during delivery.

## 6. Required Screen Inventory & Workflows
Design the following core areas:

### A. KYC / Profile Workflow
- Clean, step-by-step progressive forms for Driver Details (Name, Aadhaar, PAN, DOB, Licence, Work Preference: Full-time/Part-time) and Vehicle Details.
- Streamlined camera capture for Document Uploads.
- Clear "Verification Pending" and "Approved/Rejected" states.
- A read-only Profile screen for approved drivers (do not show editable KYC forms here).

### B. Home Requirements (Operational Dashboard)
Home must be an operational dashboard. It should contain only information genuinely useful on Home.
- **Header:** Driver Name, ID, Role (Full/Part Time), and a prominent Online/Offline toggle.
- **Offline State:** Clean resting state indicating no orders will be received.
- **Online (Waiting) State:** Clear indication the driver is waiting for an assignment. Do NOT use fake radar animations.
- **Active Assignment State:** When an order is assigned, it should dominate the screen (e.g., an overlay or large card), surfacing the immediate next action.
- **Summary:** A compact summary of today's earnings, incentives, and shift progress.
- **Prohibited on Home:** Do not turn this into a second Orders screen, History screen, Profile, or generic shortcut grid.

### C. Delivery Workflow (Progressive Disclosure)
The workflow is strictly: **Driver At Store → Order Assigned → Review Order → Confirm Pickup → Out For Delivery → Navigate To Customer → Confirm Delivery → Delivered.**
- **Pickup Stage:** Driver is at the store. Show Order ID and package list to verify. Provide a primary action to take a photo of the package and "Confirm Pickup". *Hide the customer's exact delivery address here.*
- **Delivery Stage:** Driver is on the bike. Show Customer Name, Contact CTA, Delivery Address, and a prominent "Navigate" button (Map). Provide a final "Mark Delivered" action. *Hide the package item list.*

### D. Notifications Workflow
- Simple, chronological list of alerts (Assignments, System alerts). Unread vs Read states.

## 7. Visual UX Principles & Quality Bar
- **Professional & Premium:** The app should feel like a modern, premium operational tool suitable for client presentation and implementation handoff.
- **Prohibited Styles ("No AI-Dashboard Rule"):** Do not use generic card walls, excessive rounded cards, giant empty-state panels, meaningless badges, giant icons, or financial/admin-dashboard styling.
- **Information Ownership ("No Repetition Rule"):** Use progressive disclosure. Each screen has a clear responsibility. Do not duplicate profile information or navigation actions.
- **Typography & Spacing:** Use a clean, legible sans-serif. Create a strong hierarchy. Avoid heavy drop shadows.

## 8. Responsive & Accessibility Requirements
- **Responsive:** Fluid width (320px to 430px+). Truncate long text properly. Keep primary CTAs sticky at the bottom above safe areas.
- **Accessibility:** Minimum 48x48dp touch targets. WCAG AA contrast. Communicate state changes using Text + Icon + Color (never color alone).

## 9. Content Preservation & Removal Rules
- **Content Preservation:** You have the freedom to rethink layout, component structure, typography, spacing, grouping, wording, and screen composition. However, you **MUST NOT silently remove required product content**.
- **Removal Register:** If you decide a specific piece of information should be removed for UX reasons, you MUST provide an explicit Removal Register stating what was removed, why, and where it is now represented (if applicable).
- **Approved Additions:** You may add UX improvements, missing interaction affordances, better empty states, and clearer state communication.
- **Prohibited Additions:** You **MUST NOT** invent unsupported business functionality (e.g., do not add a wallet, chat system, route optimization, accept/reject buttons, or "navigate to store" features).

---
**Final Deliverable Request:** Please provide the complete, reimagined UI/UX design package based on these constraints and instructions.
