export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'FULL' | 'LOCKED';
export type SlotFilter = 'ALL' | 'AVAILABLE' | 'BOOKED';

export interface SlotItem {
  id: string;
  timeRange: string;
  demand: string;
  bonusText?: string;
  status: SlotStatus;
}

export interface DaySlotSchedule {
  dateKey: string;
  dayShort: string;
  dayName: string;
  dayNumber: string;
  dateLabel: string;
  isToday?: boolean;
  slots: SlotItem[];
}
