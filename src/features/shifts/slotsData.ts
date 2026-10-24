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

// THIS WEEK: Sunday 11 Oct to Saturday 17 Oct
export const THIS_WEEK_SCHEDULE: DaySlotSchedule[] = [
  {
    dateKey: '2026-10-11',
    dayShort: 'Sun',
    dayName: 'Sunday',
    dayNumber: '11',
    dateLabel: '11 Oct',
    slots: [
      {
        id: 'tw_sun1',
        timeRange: '8:00 AM – 12:00 PM',
        demand: 'High demand',
        bonusText: '+₹100 bonus',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_sun2',
        timeRange: '12:00 PM – 4:00 PM',
        demand: 'High demand',
        bonusText: '+₹100 bonus',
        status: 'BOOKED',
      },
      {
        id: 'tw_sun3',
        timeRange: '5:00 PM – 10:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    dateKey: '2026-10-12',
    dayShort: 'Mon',
    dayName: 'Monday',
    dayNumber: '12',
    dateLabel: '12 Oct',
    slots: [
      {
        id: 'tw_mon1',
        timeRange: '8:00 AM – 12:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_mon2',
        timeRange: '12:00 PM – 4:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_mon3',
        timeRange: '5:00 PM – 10:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    dateKey: '2026-10-13',
    dayShort: 'Tue',
    dayName: 'Tuesday',
    dayNumber: '13',
    dateLabel: '13 Oct',
    slots: [
      {
        id: 'tw_tue1',
        timeRange: '8:00 AM – 12:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_tue2',
        timeRange: '12:00 PM – 4:00 PM',
        demand: 'High demand',
        bonusText: '+₹50 bonus',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_tue3',
        timeRange: '5:00 PM – 10:00 PM',
        demand: 'Normal demand',
        status: 'FULL',
      },
    ],
  },
  {
    dateKey: '2026-10-14',
    dayShort: 'Wed',
    dayName: 'Wednesday',
    dayNumber: '14',
    dateLabel: '14 Oct',
    isToday: true,
    slots: [
      {
        id: 'tw_wed1',
        timeRange: '8:00 AM – 12:00 PM',
        demand: 'Normal demand',
        status: 'BOOKED',
      },
      {
        id: 'tw_wed2',
        timeRange: '12:00 PM – 4:00 PM',
        demand: 'High demand',
        bonusText: '+₹150 bonus',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_wed3',
        timeRange: '5:00 PM – 10:00 PM',
        demand: 'High demand',
        bonusText: '+₹100 bonus',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    dateKey: '2026-10-15',
    dayShort: 'Thu',
    dayName: 'Thursday',
    dayNumber: '15',
    dateLabel: '15 Oct',
    slots: [
      {
        id: 'tw_thu1',
        timeRange: '8:00 AM – 12:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_thu2',
        timeRange: '12:00 PM – 4:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_thu3',
        timeRange: '5:00 PM – 10:00 PM',
        demand: 'High demand',
        bonusText: '+₹80 bonus',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    dateKey: '2026-10-16',
    dayShort: 'Fri',
    dayName: 'Friday',
    dayNumber: '16',
    dateLabel: '16 Oct',
    slots: [
      {
        id: 'tw_fri1',
        timeRange: '8:00 AM – 12:00 PM',
        demand: 'High demand',
        bonusText: '+₹100 bonus',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_fri2',
        timeRange: '12:00 PM – 4:00 PM',
        demand: 'High demand',
        bonusText: '+₹120 bonus',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_fri3',
        timeRange: '5:00 PM – 10:00 PM',
        demand: 'High demand',
        bonusText: '+₹150 bonus',
        status: 'BOOKED',
      },
    ],
  },
  {
    dateKey: '2026-10-17',
    dayShort: 'Sat',
    dayName: 'Saturday',
    dayNumber: '17',
    dateLabel: '17 Oct',
    slots: [
      {
        id: 'tw_sat1',
        timeRange: '8:00 AM – 12:00 PM',
        demand: 'High demand',
        bonusText: '+₹150 bonus',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_sat2',
        timeRange: '12:00 PM – 4:00 PM',
        demand: 'High demand',
        bonusText: '+₹200 bonus',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_sat3',
        timeRange: '5:00 PM – 10:00 PM',
        demand: 'High demand',
        bonusText: '+₹180 bonus',
        status: 'AVAILABLE',
      },
    ],
  },
];

// NEXT WEEK: Sunday 18 Oct to Saturday 24 Oct (Locked by default)
export const NEXT_WEEK_SCHEDULE: DaySlotSchedule[] = [
  {
    dateKey: '2026-10-18',
    dayShort: 'Sun',
    dayName: 'Sunday',
    dayNumber: '18',
    dateLabel: '18 Oct',
    slots: [
      { id: 'nw_sun1', timeRange: '8:00 AM – 12:00 PM', demand: 'High demand', bonusText: '+₹100 bonus', status: 'LOCKED' },
      { id: 'nw_sun2', timeRange: '12:00 PM – 4:00 PM', demand: 'High demand', bonusText: '+₹100 bonus', status: 'LOCKED' },
      { id: 'nw_sun3', timeRange: '5:00 PM – 10:00 PM', demand: 'Normal demand', status: 'LOCKED' },
    ],
  },
  {
    dateKey: '2026-10-19',
    dayShort: 'Mon',
    dayName: 'Monday',
    dayNumber: '19',
    dateLabel: '19 Oct',
    slots: [
      { id: 'nw_mon1', timeRange: '8:00 AM – 12:00 PM', demand: 'Normal demand', status: 'LOCKED' },
      { id: 'nw_mon2', timeRange: '12:00 PM – 4:00 PM', demand: 'Normal demand', status: 'LOCKED' },
      { id: 'nw_mon3', timeRange: '5:00 PM – 10:00 PM', demand: 'Normal demand', status: 'LOCKED' },
    ],
  },
  {
    dateKey: '2026-10-20',
    dayShort: 'Tue',
    dayName: 'Tuesday',
    dayNumber: '20',
    dateLabel: '20 Oct',
    slots: [
      { id: 'nw_tue1', timeRange: '8:00 AM – 12:00 PM', demand: 'Normal demand', status: 'LOCKED' },
      { id: 'nw_tue2', timeRange: '12:00 PM – 4:00 PM', demand: 'Normal demand', status: 'LOCKED' },
      { id: 'nw_tue3', timeRange: '5:00 PM – 10:00 PM', demand: 'Normal demand', status: 'LOCKED' },
    ],
  },
  {
    dateKey: '2026-10-21',
    dayShort: 'Wed',
    dayName: 'Wednesday',
    dayNumber: '21',
    dateLabel: '21 Oct',
    slots: [
      { id: 'nw_wed1', timeRange: '8:00 AM – 12:00 PM', demand: 'High demand', status: 'LOCKED' },
      { id: 'nw_wed2', timeRange: '12:00 PM – 4:00 PM', demand: 'Normal demand', status: 'LOCKED' },
      { id: 'nw_wed3', timeRange: '5:00 PM – 10:00 PM', demand: 'Normal demand', status: 'LOCKED' },
    ],
  },
  {
    dateKey: '2026-10-22',
    dayShort: 'Thu',
    dayName: 'Thursday',
    dayNumber: '22',
    dateLabel: '22 Oct',
    slots: [
      { id: 'nw_thu1', timeRange: '8:00 AM – 12:00 PM', demand: 'High demand', status: 'LOCKED' },
      { id: 'nw_thu2', timeRange: '12:00 PM – 4:00 PM', demand: 'Normal demand', status: 'LOCKED' },
      { id: 'nw_thu3', timeRange: '5:00 PM – 10:00 PM', demand: 'Normal demand', status: 'LOCKED' },
    ],
  },
  {
    dateKey: '2026-10-23',
    dayShort: 'Fri',
    dayName: 'Friday',
    dayNumber: '23',
    dateLabel: '23 Oct',
    slots: [
      { id: 'nw_fri1', timeRange: '8:00 AM – 12:00 PM', demand: 'Normal demand', status: 'LOCKED' },
      { id: 'nw_fri2', timeRange: '12:00 PM – 4:00 PM', demand: 'High demand', status: 'LOCKED' },
      { id: 'nw_fri3', timeRange: '5:00 PM – 10:00 PM', demand: 'High demand', status: 'LOCKED' },
    ],
  },
  {
    dateKey: '2026-10-24',
    dayShort: 'Sat',
    dayName: 'Saturday',
    dayNumber: '24',
    dateLabel: '24 Oct',
    slots: [
      { id: 'nw_sat1', timeRange: '8:00 AM – 12:00 PM', demand: 'High demand', status: 'LOCKED' },
      { id: 'nw_sat2', timeRange: '12:00 PM – 4:00 PM', demand: 'High demand', status: 'LOCKED' },
      { id: 'nw_sat3', timeRange: '5:00 PM – 10:00 PM', demand: 'High demand', status: 'LOCKED' },
    ],
  },
];
