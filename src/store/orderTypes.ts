export type OrderStatus = 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'ARRIVED' | 'DELIVERED' | 'RETURNING';
export type OrderType = 'STANDARD' | 'TRY_AND_BUY';

export type TryAndBuyStage = 
  | 'HANDOVER_PENDING'       // Phase C: Handover package to customer to start trial
  | 'TRIAL_IN_PROGRESS'      // Phase D: Customer is trying items (countdown active)
  | 'SELECTION_CONFIRMED'    // Phase E/F: Customer selected keep/return items
  | 'RETURN_COLLECTION'      // Phase G: Physical return collection & verification
  | 'PAYMENT_PENDING'        // Phase H: Final price calculation & payment settlement
  | 'RETURNING_TO_STORE'     // Phase I: Heading back to darkstore with returned items
  | 'STORE_RECONCILIATION'   // Phase J: Darkstore staff reconciling returned items
  | 'WAITING_STORE_CONFIRMATION'; // Phase K: Waiting for supervisor confirmation

export interface OrderItem {
  id: string;
  name: string;
  variant?: string;
  quantity: number;
  price: number;
  image?: string;
  // Try & Buy item state
  decision?: 'KEEP' | 'RETURN';
  collected?: boolean;
  returnCondition?: 'GOOD' | 'DAMAGED' | 'TAG_MISSING';
}

export interface Order {
  id: string;
  orderType: OrderType;
  isTryAndBuy: boolean;
  status: OrderStatus;
  pickupLocation: string;
  pickupTime: string | null;
  itemsCount: number;
  toteId: string;
  customerName: string;
  customerAddress: string;
  customerPhone?: string;
  distance: string;
  eta: string;
  date: string;
  items?: OrderItem[];
  accepted?: boolean;
  earnings?: number;

  // Try & Buy workflow metadata
  tryAndBuyStage?: TryAndBuyStage;
  trialDurationMinutes?: number;
  handoverConfirmedAt?: string | null;
  trialStartedAt?: string | null;
  trialEndsAt?: string | null;
  paymentMethod?: 'COD' | 'PREPAID';
  originalTotal?: number;
  finalPayableTotal?: number;
  amountPaid?: number;
  amountDue?: number;
  refundAmount?: number;
  paymentStatus?: 'PAID' | 'DUE' | 'REFUNDED' | 'COLLECTED';
  returnManifestId?: string;
  returnImages?: string[];
  storeReconciliationStatus?: 'PENDING' | 'RECONCILED' | 'DISCREPANCY';
  storeReconciledAt?: string | null;
}
