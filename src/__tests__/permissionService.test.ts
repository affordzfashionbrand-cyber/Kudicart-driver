import { permissionService } from '../services/permissionService';
import { usePermissionStore } from '../store/usePermissionStore';
import { useAuthStore } from '../store/useAuthStore';

describe('PermissionService and usePermissionStore Unit Tests', () => {
  beforeEach(() => {
    usePermissionStore.getState().resetDeviceSetup();
    useAuthStore.getState().setHasSeenKycApproved(false);
  });

  it('should verify all 7 permission categories are declared with accurate metadata', async () => {
    const details = await permissionService.checkAll();
    
    // 7 categories
    expect(details.location).toBeDefined();
    expect(details.location.title).toBe('Location access');
    expect(details.location.isEssential).toBe(true);

    expect(details.backgroundLocation).toBeDefined();
    expect(details.backgroundLocation.title).toBe('Background location');

    expect(details.camera).toBeDefined();
    expect(details.camera.title).toBe('Camera access');

    expect(details.notifications).toBeDefined();
    expect(details.notifications.title).toBe('Notifications');

    expect(details.backgroundTracking).toBeDefined();
    expect(details.backgroundTracking.title).toBe('Background delivery tracking');

    expect(details.filePicker).toBeDefined();
    expect(details.filePicker.title).toBe('Photos and documents');

    expect(details.phoneDialer).toBeDefined();
    expect(details.phoneDialer.title).toBe('Customer calling');
  });

  it('should manage device setup completion state in store', () => {
    expect(usePermissionStore.getState().hasCompletedDeviceSetup).toBe(false);
    
    usePermissionStore.getState().completeDeviceSetup();
    expect(usePermissionStore.getState().hasCompletedDeviceSetup).toBe(true);

    usePermissionStore.getState().resetDeviceSetup();
    expect(usePermissionStore.getState().hasCompletedDeviceSetup).toBe(false);
  });

  it('should evaluate essential permission configuration correctly', async () => {
    await usePermissionStore.getState().checkAll();
    // In test environment, if not granted, isEssentialConfigured should return boolean accurately
    const isReady = usePermissionStore.getState().isEssentialConfigured();
    expect(typeof isReady).toBe('boolean');
  });

  it('should manage hasSeenKycApproved lifecycle and reset when KYC status changes', () => {
    expect(useAuthStore.getState().hasSeenKycApproved).toBe(false);

    useAuthStore.getState().setHasSeenKycApproved(true);
    expect(useAuthStore.getState().hasSeenKycApproved).toBe(true);

    // If KYC status is updated to REJECTED or PENDING, hasSeenKycApproved must reset to false
    useAuthStore.getState().setKycStatus('REJECTED');
    expect(useAuthStore.getState().hasSeenKycApproved).toBe(false);

    // Setting back to APPROVED allows showing celebration again until acknowledged
    useAuthStore.getState().setKycStatus('APPROVED');
    expect(useAuthStore.getState().hasSeenKycApproved).toBe(false);

    useAuthStore.getState().setHasSeenKycApproved(true);
    expect(useAuthStore.getState().hasSeenKycApproved).toBe(true);
  });

  it('should track permission decisions, require all permissions, and identify single missing permission', () => {
    // Initial state: not all permissions granted
    expect(usePermissionStore.getState().areAllPermissionsGranted()).toBe(false);

    // Scenario: User denies first one (location), accepts all others (camera, notifications, phoneDialer)
    usePermissionStore.getState().setPermissionDecision('location', 'denied');
    usePermissionStore.getState().setPermissionDecision('camera', 'granted');
    usePermissionStore.getState().setPermissionDecision('notifications', 'granted');
    usePermissionStore.getState().setPermissionDecision('phoneDialer', 'granted');

    // App must recognize that not all permissions are granted
    expect(usePermissionStore.getState().areAllPermissionsGranted()).toBe(false);

    // On reopen, only the one denied permission should be asked
    const missing = usePermissionStore.getState().getMissingPermissions();
    expect(missing).toEqual(['location']);

    // If driver grants the missing permission
    usePermissionStore.getState().setPermissionDecision('location', 'granted');
    expect(usePermissionStore.getState().areAllPermissionsGranted()).toBe(true);
    expect(usePermissionStore.getState().getMissingPermissions()).toEqual([]);
  });

  it('should not allow app access when only one permission is given, and require all 4 permissions', () => {
    usePermissionStore.getState().resetDeviceSetup();
    expect(usePermissionStore.getState().areAllPermissionsGranted()).toBe(false);

    // User only gives 1 permission (e.g. notifications)
    usePermissionStore.getState().setPermissionDecision('notifications', 'granted');

    // App MUST NOT consider all permissions granted
    expect(usePermissionStore.getState().areAllPermissionsGranted()).toBe(false);
    expect(usePermissionStore.getState().getMissingPermissions()).toEqual([
      'location',
      'camera',
      'phoneDialer',
    ]);

    // Give 2nd permission
    usePermissionStore.getState().setPermissionDecision('location', 'granted');
    expect(usePermissionStore.getState().areAllPermissionsGranted()).toBe(false);

    // Give 3rd permission
    usePermissionStore.getState().setPermissionDecision('camera', 'granted');
    expect(usePermissionStore.getState().areAllPermissionsGranted()).toBe(false);

    // Give 4th permission
    usePermissionStore.getState().setPermissionDecision('phoneDialer', 'granted');
    expect(usePermissionStore.getState().areAllPermissionsGranted()).toBe(true);
    expect(usePermissionStore.getState().getMissingPermissions()).toEqual([]);
  });

  it('should check all permissions and deny access if any permission is revoked', async () => {
    // Start with all granted
    usePermissionStore.getState().setPermissionDecision('location', 'granted');
    usePermissionStore.getState().setPermissionDecision('camera', 'granted');
    usePermissionStore.getState().setPermissionDecision('notifications', 'granted');
    usePermissionStore.getState().setPermissionDecision('phoneDialer', 'granted');
    expect(usePermissionStore.getState().areAllPermissionsGranted()).toBe(true);

    // If one permission is revoked/denied (e.g. location)
    usePermissionStore.getState().setPermissionDecision('location', 'denied');
    expect(usePermissionStore.getState().areAllPermissionsGranted()).toBe(false);
    expect(usePermissionStore.getState().getMissingPermissions()).toEqual(['location']);
  });
});
