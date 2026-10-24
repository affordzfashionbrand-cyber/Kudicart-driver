export interface FullTimeShift {
  id: string;
  day: string;
  dateStr: string;
  timeRange: string;
  duration: string;
  breakDuration?: string;
  hub: string;
  hubAddress: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'SCHEDULED' | 'COMPLETED' | 'DAY_OFF';
  statusLabel: string;
  isToday?: boolean;
}

export const FULL_TIME_WEEK_SCHEDULE: FullTimeShift[] = [
  {
    id: 'ft1',
    day: 'Saturday',
    dateStr: '17 Oct',
    timeRange: 'No shift scheduled',
    duration: '0 hours',
    hub: '',
    hubAddress: '',
    status: 'DAY_OFF',
    statusLabel: 'Day off',
  },
  {
    id: 'ft2',
    day: 'Friday',
    dateStr: '16 Oct',
    timeRange: '9:00 AM – 6:00 PM',
    duration: '9 hours including break',
    breakDuration: '1 hour',
    hub: 'KudiCart Darkstore',
    hubAddress: 'HSR Sector 2, 12th Main Road',
    status: 'SCHEDULED',
    statusLabel: 'Scheduled',
  },
  {
    id: 'ft3',
    day: 'Thursday',
    dateStr: '15 Oct',
    timeRange: '9:00 AM – 6:00 PM',
    duration: '9 hours including break',
    breakDuration: '1 hour',
    hub: 'KudiCart Darkstore',
    hubAddress: 'HSR Sector 2, 12th Main Road',
    status: 'UPCOMING',
    statusLabel: 'Upcoming',
  },
  {
    id: 'ft4',
    day: 'Wednesday',
    dateStr: '14 Oct',
    timeRange: '9:00 AM – 6:00 PM',
    duration: '9 hours including break',
    breakDuration: '1 hour',
    hub: 'KudiCart Darkstore',
    hubAddress: 'HSR Sector 2, 12th Main Road',
    status: 'UPCOMING',
    statusLabel: 'Upcoming',
    isToday: true,
  },
  {
    id: 'ft5',
    day: 'Tuesday',
    dateStr: '13 Oct',
    timeRange: '9:00 AM – 6:00 PM',
    duration: '9 hours including break',
    breakDuration: '1 hour',
    hub: 'KudiCart Darkstore',
    hubAddress: 'HSR Sector 2, 12th Main Road',
    status: 'COMPLETED',
    statusLabel: 'Completed',
  },
  {
    id: 'ft6',
    day: 'Monday',
    dateStr: '12 Oct',
    timeRange: '9:00 AM – 6:00 PM',
    duration: '9 hours including break',
    breakDuration: '1 hour',
    hub: 'KudiCart Darkstore',
    hubAddress: 'HSR Sector 2, 12th Main Road',
    status: 'COMPLETED',
    statusLabel: 'Completed',
  },
  {
    id: 'ft7',
    day: 'Sunday',
    dateStr: '11 Oct',
    timeRange: 'No shift scheduled',
    duration: '0 hours',
    hub: '',
    hubAddress: '',
    status: 'DAY_OFF',
    statusLabel: 'Day off',
  },
];

export const getStatusBadgeStyle = (status: FullTimeShift['status']) => {
  switch (status) {
    case 'UPCOMING':
      return {
        bg: '#FFE2D5',
        text: '#D94B17',
        border: '#FFDAC8',
      };
    case 'IN_PROGRESS':
    case 'COMPLETED':
      return {
        bg: '#EDFDF5',
        text: '#16805A',
        border: '#C1F2D9',
      };
    case 'DAY_OFF':
      return {
        bg: '#F3F1EC',
        text: '#8A8781',
        border: '#E2DED7',
      };
    case 'SCHEDULED':
    default:
      return {
        bg: '#F3F1EC',
        text: '#65635F',
        border: '#E2DED7',
      };
  }
};
