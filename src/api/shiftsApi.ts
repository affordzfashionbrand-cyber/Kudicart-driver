import { request } from './client';

export interface ShiftScheduleResponse {
  todayShift: any;
  weekSchedule: any[];
}

export interface SlotListingResponse {
  week: 'THIS_WEEK' | 'NEXT_WEEK';
  isLocked: boolean;
  lockMessage: string | null;
  schedule: Array<{
    dateKey: string;
    dayShort: string;
    dayName: string;
    dayNumber: string;
    dateLabel: string;
    isToday: boolean;
    slots: Array<{
      id: string;
      timeRange: string;
      demand: string;
      bonusText?: string;
      capacity: number;
      bookedCount: number;
      status: 'AVAILABLE' | 'BOOKED' | 'FULL' | 'LOCKED';
    }>;
  }>;
}

export interface ShiftHistoryResponse {
  mode: 'SHIFT_HISTORY' | 'SLOT_HISTORY';
  workPreference: 'FULL_TIME' | 'PART_TIME';
  weekIndex: number;
  label: string;
  totalShifts?: number;
  completedShifts?: number;
  totalHours?: number;
  completedSlots?: number;
  bookedHours?: number;
  deliveries: number;
  totalEarnings: number;
  items: Array<{
    id: string;
    slotId?: string;
    day: string;
    dateLabel: string;
    dateKey?: string;
    timeRange: string;
    duration: string;
    hub?: string;
    hubAddress?: string;
    demand?: string;
    bonusText?: string | null;
    status: string;
    statusLabel: string;
    attendance?: string;
    breakTime?: string | null;
    hours: number;
  }>;
  availableWeeks: Array<{ weekIndex: number; label: string }>;
}

export const shiftsApi = {
  getShifts: async (): Promise<ShiftScheduleResponse> => {
    return request<ShiftScheduleResponse>('/driver/shifts', { method: 'GET' });
  },

  getHistory: async (weekIndex = 0): Promise<ShiftHistoryResponse> => {
    return request<ShiftHistoryResponse>(`/driver/shifts/history?weekIndex=${weekIndex}`, {
      method: 'GET',
    });
  },

  getSlots: async (week: 'THIS_WEEK' | 'NEXT_WEEK' = 'THIS_WEEK'): Promise<SlotListingResponse> => {
    return request<SlotListingResponse>(`/driver/shifts/slots?week=${week}`, { method: 'GET' });
  },

  bookSlot: async (slotId: string) => {
    return request<any>('/driver/shifts/slots/book', {
      method: 'POST',
      body: JSON.stringify({ slotId }),
    });
  },

  cancelSlot: async (slotId: string) => {
    return request<any>('/driver/shifts/slots/cancel', {
      method: 'POST',
      body: JSON.stringify({ slotId }),
    });
  },
};
