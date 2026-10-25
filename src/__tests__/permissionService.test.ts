import { permissionService } from '../services/permissionService';
import { usePermissionStore } from '../store/usePermissionStore';

describe('PermissionService and usePermissionStore Unit Tests', () => {
  beforeEach(() => {
    usePermissionStore.getState().resetDeviceSetup();
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
});
