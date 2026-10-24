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

export const shiftsApi = {
  getShifts: async (): Promise<ShiftScheduleResponse> => {
    return request<ShiftScheduleResponse>('/driver/shifts', { method: 'GET' });
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
