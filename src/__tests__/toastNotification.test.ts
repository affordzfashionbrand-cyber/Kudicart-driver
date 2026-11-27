import { useToastStore, toast, resetToastInternalState } from '../store/useToastStore';
import { useDriverStore } from '../store/useDriverStore';
import { useOrderStore } from '../store/useOrderStore';
import { profileApi } from '../api';

describe('Universal Toast Notification System', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetToastInternalState();
    useToastStore.getState().hideToast();
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

  it('7. Suppresses background notification events unconditionally', () => {
    toast.info('Background sync updated', { isBackground: true });
    expect(useToastStore.getState().currentToast).toBeNull();
  });

  it('8. Deduplicates by explicit dedupeKey within cooldown and allows re-trigger after expiry', () => {
    toast.show({
      type: 'info',
      message: 'First wording',
      dedupeKey: 'fcm:order-123',
    });
    const firstId = useToastStore.getState().currentToast?.id;
    expect(firstId).toBeDefined();

    // Even with slightly different message copy, identical dedupeKey is suppressed within 1800ms
    jest.advanceTimersByTime(500);
    toast.show({
      type: 'info',
      message: 'Second wording',
      dedupeKey: 'fcm:order-123',
    });
    expect(useToastStore.getState().currentToast?.id).toBe(firstId);
    expect(useToastStore.getState().currentToast?.message).toBe('First wording');

    // Past 1800ms dedupe window, the same dedupeKey can notify again
    jest.advanceTimersByTime(1400);
    toast.show({
      type: 'info',
      message: 'Updated wording',
      dedupeKey: 'fcm:order-123',
    });
    expect(useToastStore.getState().currentToast?.id).not.toBe(firstId);
    expect(useToastStore.getState().currentToast?.message).toBe('Updated wording');
  });

  it('9. Throttles burst error storms while permitting initial distinct error feedback', () => {
    toast.error('Error one');
    expect(useToastStore.getState().currentToast?.message).toBe('Error one');

    toast.error('Error two');
    expect(useToastStore.getState().currentToast?.message).toBe('Error two');

    // 3rd distinct error inside 1200ms flood window is dropped to prevent notification flooding
    toast.error('Error three flood');
    expect(useToastStore.getState().currentToast?.message).toBe('Error two');

    // After flood window elapses, new errors display again
    jest.advanceTimersByTime(1300);
    toast.error('Error after cooldown');
    expect(useToastStore.getState().currentToast?.message).toBe('Error after cooldown');
  });

  it('10. Tracks expiresAt accurately and cleans up stale timers across rapid replacements', () => {
    toast.info('Short lived', { duration: 1000 });
    expect(useToastStore.getState().currentToast?.expiresAt).toBeDefined();

    toast.info('Persistent toast', { duration: 0 });
    expect(useToastStore.getState().currentToast?.expiresAt).toBeUndefined();

    jest.advanceTimersByTime(2000);
    expect(useToastStore.getState().currentToast?.message).toBe('Persistent toast');
  });

  it('11. Keeps store-level profile & order validation/API errors contextual without firing global toasts', async () => {
    jest.spyOn(profileApi, 'updateDetails').mockRejectedValueOnce(new Error('Validation rejected'));

    const result = await useDriverStore.getState().updateProfileAsync({ fullName: 'Test Driver' });
    expect(result).toEqual({ success: false, error: 'Validation rejected' });
    expect(useDriverStore.getState().lastError).toBe('Validation rejected');
    expect(useToastStore.getState().currentToast).toBeNull();

    useOrderStore.getState().confirmHandoverAndStartTrial('ORD-100', '');
    expect(useOrderStore.getState().lastSyncError).toBe('Customer OTP is required to confirm handover.');
    expect(useToastStore.getState().currentToast).toBeNull();
  });
});
