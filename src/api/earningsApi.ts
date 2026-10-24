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

export interface BonusProgressResponse {
  dailyBonus: {
    completedOrders: number;
    targetOrders: number;
    rewardEarned: number;
    nextReward: number;
    ordersRemaining: number;
    status: string;
    milestones: Array<{ orders: number; bonus: number; reached: boolean }>;
  };
  weeklyBonus: {
    completedOrders: number;
    targetOrders: number;
    rewardEarned: number;
    nextReward: number;
    ordersRemaining: number;
    workingDays: number;
    targetWorkingDays: number;
    status: string;
    milestones: Array<{ orders: number; bonus: number; reached: boolean }>;
  };
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

  getOpportunities: async () => {
    return request<any[]>('/driver/earnings/opportunities', { method: 'GET' });
  },

  getSurges: async () => {
    return request<{ activeSurges: any[]; count: number }>('/driver/earnings/surges', {
      method: 'GET',
    });
  },
};
