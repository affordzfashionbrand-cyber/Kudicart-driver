export interface EarningOrder {
  id: string;
  amount: string;
  time: string;
}

export interface EarningDay {
  id: string;
  date: string;
  dayName: string;
  earnings: string;
  deliveries: number;
  activeHours: string;
  bonus: string;
  orders: EarningOrder[];
}

export interface EarningWeek {
  id: number;
  label: string;
  totalEarnings: string;
  orderPay: string;
  bonus: string;
  deliveries: number;
  activeHours: string;
  days: EarningDay[];
}

