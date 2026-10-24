/**
 * Affordz Delivery Partner Legal Policies
 * Generated directly from the Affordz Delivery Partner Policy (Pilot Version — Chennai Launch)
 */

export interface LegalSection {
  title: string;
  content: string[];
  subsections?: Array<{
    subtitle: string;
    items: string[];
  }>;
  table?: {
    headers: string[];
    rows: string[][];
  };
  callout?: string;
}

export interface LegalDocument {
  title: string;
  version: string;
  location: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const TERMS_AND_CONDITIONS: LegalDocument = {
  title: 'Affordz Delivery Partner Terms & Conditions',
  version: 'Pilot Version — Chennai Launch',
  location: 'Chennai, Tamil Nadu',
  lastUpdated: 'Effective October 2026',
  sections: [
    {
      title: '1. Purpose & Pilot Scope',
      content: [
        'This Delivery Partner Policy defines the working structure, delivery payouts, incentives, attendance requirements, performance targets, and operational rules for Affordz Delivery Partners during the Chennai pilot.',
        'The policy is designed to provide delivery partners with a reasonable earning opportunity while maintaining sustainable delivery economics for Affordz.',
        'This is a pilot policy and may be reviewed and modified based on actual operational data, delivery demand, partner feedback, and business requirements.',
      ],
    },
    {
      title: '2. Delivery Partner Categories & Commitments',
      content: [
        'Affordz initially operates two delivery partner categories:',
      ],
      subsections: [
        {
          subtitle: 'A. Full-Time Delivery Partner',
          items: [
            'Working hours: 8 hours/day',
            'Working days: 6 days/week',
            'Weekly day off: 1 scheduled day (does not count as an absence)',
            'Weekly eligible order target: 119 completed orders (approx. 19.83 orders/day or 2.48 orders/hour)',
            'Attendance & performance bonus: ₹1,100/week upon meeting all eligibility criteria',
            'Maximum delivery radius: 3.0 km standard radius',
          ],
        },
        {
          subtitle: 'B. Part-Time Delivery Partner',
          items: [
            'Working hours: 5 hours/day',
            'Working days: 6 days/week',
            'Weekly day off: 1 scheduled day (does not count as an absence)',
            'Weekly eligible order target: 75 completed orders (approx. 12.5 orders/day or 2.5 orders/hour)',
            'Attendance & performance bonus: ₹500/week upon meeting all eligibility criteria',
            'Maximum delivery radius: 3.0 km standard radius',
          ],
        },
      ],
      callout: 'The weekly day off is a scheduled rest day and will NOT be treated as an absence.',
    },
    {
      title: '3. Attendance & Performance Bonus Eligibility',
      content: [
        'To receive the weekly attendance & performance bonus (₹1,100 for Full-Time / ₹500 for Part-Time), the partner must satisfy all 8 eligibility conditions:',
        '1. Complete the required working schedule (8h/day for FT, 5h/day for PT).',
        '2. Work 6 days during the applicable week.',
        '3. Complete at least the weekly threshold (119 orders for FT, 75 orders for PT).',
        '4. Maintain required availability during assigned working hours.',
        '5. Follow Affordz delivery and operational procedures.',
        '6. Maintain accurate GPS/app activity where required.',
        '7. Have no serious policy, safety, fraud, or misconduct violation.',
        '8. Complete only genuine and verified deliveries.',
      ],
    },
    {
      title: '4. Delivery Distance & Base Payout Structure',
      content: [
        'Affordz delivery partners receive the following base payout for eligible completed deliveries:',
      ],
      table: {
        headers: ['Delivery Distance', 'Base Payout'],
        rows: [
          ['0 — 1 km', '₹20 / order'],
          ['Above 1 km — 2 km', '₹25 / order'],
          ['Above 2 km — 3 km', '₹30 / order'],
        ],
      },
      callout: 'Maximum standard delivery radius during the pilot is 3.0 km. Deliveries beyond 3 km are assigned only when specifically approved.',
    },
    {
      title: '5. Daily Performance Incentives',
      content: [
        'Partners receive progressive daily performance bonuses based on eligible orders delivered during that day. Amounts represent the total daily bonus earned for that day, not an additional amount for every previous order:',
      ],
      table: {
        headers: ['Eligible Orders / Day', 'Total Daily Bonus'],
        rows: [
          ['Below 15 orders', '₹0'],
          ['15 orders', '₹50'],
          ['16 orders', '₹55'],
          ['17 orders', '₹60'],
          ['18 orders', '₹65'],
          ['19 orders', '₹78'],
          ['20 orders', '₹86'],
          ['21 orders', '₹94'],
          ['22 orders', '₹102'],
          ['23 orders', '₹110'],
          ['24 orders', '₹120'],
          ['25 orders', '₹130'],
          ['26 orders', '₹140'],
          ['27 orders', '₹150'],
          ['28 orders', '₹160'],
          ['29 orders', '₹170'],
          ['30 orders', '₹175'],
          ['31+ orders', '₹175 + ₹5 for each additional eligible order (subject to applicable cap)'],
        ],
      },
    },
    {
      title: '6. Peak-Hour Incentives & Customer Tips',
      content: [
        'Peak-Hour Incentive: When high-demand periods are officially activated by Affordz, an additional ₹5 per eligible completed order is credited.',
        'Customer Tips: 100% of customer tips belong to the Delivery Partner. Affordz does not retain any portion or commission from customer tips.',
        'Tips are separate from base delivery payout, daily incentives, peak-hour incentives, and attendance bonuses.',
      ],
    },
    {
      title: '7. Customer Delivery Fee Structure (Reference)',
      content: [
        'The customer delivery fee is paid by the customer according to the order value:',
      ],
      table: {
        headers: ['Order Value', 'Customer Delivery Fee'],
        rows: [
          ['Below ₹400', '₹49'],
          ['₹400 — ₹699', '₹49'],
          ['₹700 and above', 'FREE'],
        ],
      },
      callout: 'The customer delivery fee does not represent the delivery partner payout. Partner payout is determined separately under Section 4.',
    },
    {
      title: '8. Eligible Order Criteria',
      content: [
        'To qualify for payout and incentives, an order must be a genuine Affordz order, assigned through approved dispatch, successfully picked up, delivered to the customer, and verified via GPS/system.',
        'Non-qualifying orders include: cancelled orders, fake/duplicate orders, fraudulent orders, orders incorrectly marked as completed, orders not actually delivered, or orders identified as manipulated.',
      ],
    },
    {
      title: '9. Safety Requirements (Zero Compromise)',
      content: [
        'Safety takes priority over delivery targets and incentives. Delivery partners must never compromise safety merely to meet an order target or timeline.',
        'Mandatory rules: Wear required helmet and safety equipment; follow traffic rules; avoid dangerous driving; never use unsafe shortcuts or ride recklessly; never handle a mobile phone unsafely while riding; report accidents immediately.',
      ],
    },
    {
      title: '10. Vehicle, Fuel & Operating Costs',
      content: [
        'Unless separately agreed in writing, the Delivery Partner is responsible for maintaining their own vehicle and operating requirements, including: fuel, vehicle maintenance, vehicle documents, insurance, smartphone, and active mobile data/connectivity.',
      ],
    },
    {
      title: '11. Customer Conduct & Privacy',
      content: [
        'Partners must communicate respectfully, avoid arguments, deliver to the correct location, and never harass customers. Customer information must be used solely for completing the delivery.',
        'Sharing customer numbers or addresses, saving personal details, or contacting customers after delivery is strictly prohibited.',
      ],
    },
    {
      title: '12. Store & Pickup Operations',
      content: [
        'Partners collect orders from Affordz dark-stores, partner fashion stores, or approved pickup locations.',
        'Verify order items and package integrity before departure. Report any store delay promptly through the approved Affordz support channel.',
      ],
    },
    {
      title: '13. Cancellations & Customer Unavailable Situations',
      content: [
        'If a customer is unavailable, follow the Affordz escalation process. Never leave packages at unauthorized locations or self-dispose of orders.',
        'If an order is cancelled before/during delivery, payout is assessed based on whether the partner reached pickup, collected items, or followed instructions.',
      ],
    },
    {
      title: '14. Cash on Delivery (COD) & Payment Collection',
      content: [
        'Where COD or Try & Buy doorstep payment collection is enabled: collect the exact invoice amount, record accurately, never personally use cash, and complete reconciliation within shift deadlines.',
      ],
    },
    {
      title: '15. Fraud & Telemetry Verification',
      content: [
        'Prohibited acts include fake deliveries, GPS spoofing, location spoofing, multiple-account manipulation, and false attendance.',
        'Confirmed violations result in incentive forfeiture, payment recovery, temporary suspension, or permanent deactivation.',
      ],
    },
    {
      title: '16. Illustrative Earnings Scenarios',
      content: [
        'Full-Time Example (119 orders/week at avg. ₹24.50 base = ₹2,915 + ₹508 daily incentives + ₹1,100 bonus = ₹4,523/week).',
        'Part-Time Example (75 orders/week at avg. ₹24.50 base = ₹1,837.50 + ₹500 bonus = ₹2,337.50/week).',
        'These are illustrative examples only. Payouts vary based on actual distance, demand, availability, and eligibility.',
      ],
    },
    {
      title: '17. No Guaranteed Income Disclaimer',
      content: [
        'Affordz does NOT guarantee a fixed daily or weekly income. Earnings depend on eligible orders, distances, demand, and partner availability.',
        'The ₹1,100 Full-Time and ₹500 Part-Time bonuses are conditional performance bonuses, not guaranteed payments.',
      ],
    },
  ],
};

export const PRIVACY_POLICY: LegalDocument = {
  title: 'Affordz Delivery Partner Privacy Policy',
  version: 'Pilot Version — Chennai Launch',
  location: 'Chennai, Tamil Nadu',
  lastUpdated: 'Effective October 2026',
  sections: [
    {
      title: '1. Customer Data Protection & Confidentiality',
      content: [
        'Delivery Partners receive access to customer contact details and delivery addresses solely for the purpose of executing approved Affordz deliveries.',
        'Delivery Partners are strictly prohibited from:',
        '• Sharing or disclosing customer telephone numbers or delivery locations to any third party.',
        '• Storing, copying, screenshotting, or saving customer contact details on personal devices beyond active delivery execution.',
        '• Contacting customers for personal, social, marketing, or non-delivery reasons during or after an order is completed.',
        'Any breach of customer privacy will result in immediate suspension, termination, and potential legal reporting.',
      ],
    },
    {
      title: '2. Partner Information Collected by Affordz',
      content: [
        'To facilitate identity verification, statutory tax compliance, shift assignment, and secure payouts, Affordz collects and processes:',
        '• Identity & KYC Records: Full legal name, verified mobile phone number, residential address, emergency contact, photograph, Aadhaar number, PAN card, and Driving Licence.',
        '• Vehicle Details: Vehicle make, model, registration number (RC), pollution certificate, and insurance coverage.',
        '• Real-time Telemetry: Live GPS location coordinates, delivery route trails, speed, and app engagement timestamps during online shifts.',
        '• Transaction Records: Bank account details for weekly direct deposits, ledger earnings, bonus credits, and COD settlements.',
      ],
    },
    {
      title: '3. Purposes of Data Processing',
      content: [
        'Partner personal and telemetric data is processed strictly for legitimate operational purposes:',
        '• Verifying driver credentials and government-issued transport permits.',
        '• Dispatching orders based on physical proximity and optimal route estimation (within 3 km radius).',
        '• Calculating accurate base payouts (0-1 km, 1-2 km, 2-3 km distance tiers) and performance incentives.',
        '• Ensuring partner on-road safety and investigating delivery disputes or traffic incidents.',
        '• Detecting and preventing fraudulent behavior such as location spoofing or phantom deliveries.',
      ],
    },
    {
      title: '4. Location & GPS Tracking Transparency',
      content: [
        'GPS location tracking is activated exclusively when the partner toggles "Online" or accepts an active order assignment.',
        'Location tracking allows Affordz darkstores, boutiques, and customers to monitor delivery transit in real time.',
        'Partners may toggle "Offline" at any time to suspend telemetry recording, subject to shift scheduling guidelines.',
      ],
    },
    {
      title: '5. Data Security, Retention & Partner Rights',
      content: [
        'Affordz stores all partner records in secure cloud data environments with strict role-based access control and encryption in transit.',
        'Financial and tax-related transaction histories are retained in compliance with applicable Indian commercial and tax laws.',
        'Partners may request updates to their vehicle details, banking information, or review their stored profile documents by contacting the Affordz Fleet Support Desk.',
      ],
    },
  ],
};
