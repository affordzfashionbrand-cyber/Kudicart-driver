import { useToastStore, toast } from '../store/useToastStore';

describe('Universal Toast Notification System', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useToastStore.getState().hideToast();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('1. Initializes with no active toast', () => {
    expect(useToastStore.getState().currentToast).toBeNull();
  });

  it('2. Dispatches success, error, warning, and info notifications via universal API', () => {
    toast.success('Profile updated successfully');
    let state = useToastStore.getState();
    expect(state.currentToast).not.toBeNull();
    expect(state.currentToast?.type).toBe('success');
    expect(state.currentToast?.message).toBe('Profile updated successfully');

    toast.error('Network request failed');
    state = useToastStore.getState();
    expect(state.currentToast?.type).toBe('error');
    expect(state.currentToast?.message).toBe('Network request failed');

    toast.warning('Check your internet connection');
    state = useToastStore.getState();
    expect(state.currentToast?.type).toBe('warning');
    expect(state.currentToast?.message).toBe('Check your internet connection');

    toast.info('New shift available');
    state = useToastStore.getState();
    expect(state.currentToast?.type).toBe('info');
    expect(state.currentToast?.message).toBe('New shift available');
  });

  it('3. Supports object options with title and action button', () => {
    const onActionMock = jest.fn();
    toast.show({
      message: 'Item deleted',
      type: 'info',
      title: 'Action performed',
      action: {
        label: 'Undo',
        onPress: onActionMock,
      },
      duration: 5000,
    });

    const state = useToastStore.getState();
    expect(state.currentToast?.title).toBe('Action performed');
    expect(state.currentToast?.action?.label).toBe('Undo');
    expect(state.currentToast?.duration).toBe(5000);

    state.currentToast?.action?.onPress();
    expect(onActionMock).toHaveBeenCalledTimes(1);
  });

  it('4. Automatically dismisses after the configured duration', () => {
    toast.success('Slot booked', { duration: 3000 });
    expect(useToastStore.getState().currentToast).not.toBeNull();

    // Advance halfway
    jest.advanceTimersByTime(1500);
    expect(useToastStore.getState().currentToast).not.toBeNull();

    // Advance past duration
    jest.advanceTimersByTime(1500);
    expect(useToastStore.getState().currentToast).toBeNull();
  });

  it('5. Allows manual dismissal via toast.dismiss() or toast.hide()', () => {
    toast.info('Persistent notification', { duration: 0 });
    expect(useToastStore.getState().currentToast).not.toBeNull();

    toast.dismiss();
    expect(useToastStore.getState().currentToast).toBeNull();
  });

  it('6. Predictably suppresses duplicate consecutive notifications', () => {
    toast.error('Connection timed out');
    const firstId = useToastStore.getState().currentToast?.id;
    expect(firstId).toBeDefined();

    // Immediately trigger the identical message and type
    toast.error('Connection timed out');
    const secondId = useToastStore.getState().currentToast?.id;

    // Must not recreate or replace with a new ID
    expect(secondId).toBe(firstId);

    // If message is different, it updates immediately
    toast.error('Different error message');
    const thirdId = useToastStore.getState().currentToast?.id;
    expect(thirdId).not.toBe(firstId);
    expect(useToastStore.getState().currentToast?.message).toBe('Different error message');
  });
});
