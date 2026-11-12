import type {
  OrderStatus as ContractOrderStatus,
  PaymentMethod as ContractPaymentMethod,
  PaymentStatus as ContractPaymentStatus,
  FulfillmentType,
  TryAndBuyStage as ContractTryAndBuyStage,
} from '../contracts/order-contracts';

export type OrderStatus = ContractOrderStatus;
export type OrderType = 'STANDARD' | 'TRY_AND_BUY';
export type { FulfillmentType };

export type TryAndBuyStage = ContractTryAndBuyStage;

export interface OrderItem {
  id: string;
  name: string;
  title?: string;
  variant?: string;
  size?: string;
  quantity: number;
  price: number;
  image?: string;
  // Try & Buy item state
  decision?: 'KEEP' | 'RETURN';
  tryAndBuyDecision?: 'KEEP' | 'RETURN' | null;
  collected?: boolean;
  collectedAt?: string | null;
  returnCondition?: 'GOOD' | 'DAMAGED' | 'TAG_MISSING';
}

export interface Order {
  id: string;
  orderNumber?: string;
  version?: number;
  fulfillmentType?: FulfillmentType;
  orderType: OrderType;
  isTryAndBuy: boolean;
  status: OrderStatus;
  isArrived?: boolean;
  arrivedAt?: string | null;
  deliveredAt?: string | null;
  pickupLocation: string;
  pickupAddress?: string;
  pickupTime: string | null;
  itemsCount: number;
  toteId: string;
  customerName: string;
  customerAddress: string;
  customerPhone?: string;
  pickupCoordinates?: { latitude: number; longitude: number } | null;
  deliveryCoordinates?: { latitude: number; longitude: number } | null;
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
  customerSelectionAt?: string | null;
  paymentMethod?: ContractPaymentMethod | 'PREPAID';
  originalTotal?: number;
  finalPayableTotal?: number;
  amountPaid?: number;
  amountDue?: number;
  refundAmount?: number;
  paymentStatus?: ContractPaymentStatus | 'PAID' | 'DUE';
  returnManifestId?: string;
  pickupImages?: string[];
  verificationPhotos?: string[];
  deliveryImages?: string[];
  handoverImages?: string[];
  returnImages?: string[];
  deliveryInstructions?: string | null;
  rejectedByVendor?: boolean;
  expiresAt?: string | null;
  checkoutGroupId?: string | null;
  storeReconciliationStatus?: 'PENDING' | 'RECONCILED' | 'DISCREPANCY';
  storeReconciledAt?: string | null;
}
