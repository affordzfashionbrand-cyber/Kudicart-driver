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
