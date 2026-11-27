import { request } from './client';

export interface EarningsWeekResponse {
  activeWeekIndex: number;
  label: string;
  totalEarnings: number;
  orderPay: number;
  bonus: number;
  deliveries: number;
  activeHours: string;
  days: Array<{
    id: string;
    date: string;
    dayName: string;
    earnings: number;
    deliveries: number;
    activeHours: string;
    bonus: number;
    orders: Array<{ id: string; amount: number; time: string }>;
  }>;
  availableWeeks: Array<{ id: number; label: string; totalEarnings: string }>;
}

export interface BonusTierProgress {
  id?: string;
  title?: string;
  description?: string;
  eligibility?: string;
  startsAt?: string;
  endsAt?: string;
  periodLabel?: string;
  completedOrders: number;
  targetOrders: number;
  rewardEarned: number;
  nextReward: number;
  ordersRemaining: number;
  status: string;
  milestones: Array<{ orders: number; bonus: number; reached: boolean }>;
}

export interface BonusProgressResponse {
  title?: string;
  description?: string;
  basePayoutPerOrder?: number;
  floatingCashLimit?: number;
  dailyBonus: BonusTierProgress;
  weeklyBonus: BonusTierProgress & {
    workingDays: number;
    targetWorkingDays: number;
  };
}

export interface RateCardResponse {
  basePayoutPerOrder: number;
  floatingCashLimit: number;
  payoutRules: Array<{
    id: string;
    title: string;
    amountLabel: string;
    description: string;
  }>;
  dailyMilestones: Array<{ orders: number; bonus: number }>;
  weeklyMilestones: Array<{ orders: number; bonus: number }>;
  activeSurges: Array<{
    id: string;
    title: string;
    area: string;
    timeWindow: string;
    bonusAmount: number;
  }>;
}

export const earningsApi = {
  getEarnings: async (weekIndex = 0): Promise<EarningsWeekResponse> => {
    return request<EarningsWeekResponse>(`/driver/earnings?weekIndex=${weekIndex}`, {
      method: 'GET',
    });
  },

  getBonusProgress: async (): Promise<BonusProgressResponse> => {
    return request<BonusProgressResponse>('/driver/earnings/bonus', { method: 'GET' });
  },

  getRateCard: async (): Promise<RateCardResponse> => {
    return request<RateCardResponse>('/driver/earnings/rate-card', { method: 'GET' });
  },

  getOpportunities: async () => {
    return request<any[]>('/driver/earnings/opportunities', { method: 'GET' });
  },

  getSurges: async () => {
    return request<{ activeSurges: any[]; count: number }>('/driver/earnings/surges', {
      method: 'GET',
    });
  },
};
