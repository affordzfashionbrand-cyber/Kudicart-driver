import fs from 'fs';
import path from 'path';
import {
  calculateNavigationGuidance,
  calculateRouteProgress,
  clearRouteCache,
  computeBearingDegrees,
  fetchRoadRouteDetails,
  formatDistanceMetrics,
  formatDurationLabel,
  getManeuverIconName,
  offsetCoordinateAhead,
  smoothBearingDegrees,
} from '../services/routingService';
import { setAuthToken } from '../api/client';
import { permissionService } from '../services/permissionService';
import { useLocationStore } from '../store/useLocationStore';
import { voiceNavigationService } from '../services/voiceNavigationService';

describe('Driver Map, Routing, Navigation & GPS State Suite', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    clearRouteCache();
    useLocationStore.getState().resetLocationState();
    voiceNavigationService.resetSession();
    voiceNavigationService.setMuted(false);
  });

  test('formatDistanceMetrics & formatDurationLabel eliminate duplicate units and format cleanly', () => {
    expect(formatDistanceMetrics('661.5 km', 661500).distanceLabel).toBe('661.5 km');
    expect(formatDistanceMetrics('12.4 km', 12400).distanceKm).toBe('12.4');
    expect(formatDistanceMetrics(undefined, 452).distanceLabel).toBe('450 m');
    expect(formatDurationLabel(778)).toBe('12 hr 58 min');
    expect(formatDurationLabel(18)).toBe('18 min');
    expect(formatDurationLabel(null)).toBe('—');
  });

  test('fetchRoadRouteDetails rejects straight-line fallbacks, deduplicates valid routes, and preserves turn-by-turn steps', async () => {
    setAuthToken('jwt-route-test');
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        isRealRoute: false,
        isStraightLineReference: true,
        coordinates: [
          [17.44, 78.38],
          [12.97, 80.14],
        ],
      }),
    });
    (globalThis as any).fetch = fetchMock;

    const failed = await fetchRoadRouteDetails(
      { lat: 17.44, lng: 78.38 },
      { lat: 12.97, lng: 80.14 },
    );
    expect(failed.isRealRoute).toBe(false);
    expect(failed.routeStatus).toBe('FAILED');
    expect(failed.coordinates).toEqual([]);

    fetchMock.mockClear();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        isRealRoute: true,
        isStraightLineReference: false,
        distanceKm: '4.2 km',
        distanceMeters: 4200,
        durationMinutes: 11,
        coordinates: [
          [12.97, 77.64],
          [12.975, 77.64],
          [12.98, 77.645],
        ],
        steps: [
          {
            maneuver: 'STRAIGHT',
            instruction: 'Continue on Jai Hind Gandhi Rd',
            streetName: 'Jai Hind Gandhi Rd',
            distanceMeters: 550,
            durationSeconds: 90,
            startLocation: { latitude: 12.97, longitude: 77.64 },
            endLocation: { latitude: 12.975, longitude: 77.64 },
            coordinates: [
              [12.97, 77.64],
              [12.975, 77.64],
            ],
          },
          {
            maneuver: 'TURN_RIGHT',
            instruction: 'Turn right onto Main Road',
            streetName: 'Main Road',
            distanceMeters: 600,
            durationSeconds: 100,
            startLocation: { latitude: 12.975, longitude: 77.64 },
            endLocation: { latitude: 12.98, longitude: 77.645 },
            coordinates: [
              [12.975, 77.64],
              [12.98, 77.645],
            ],
          },
        ],
      }),
    });

    const [first, second] = await Promise.all([
      fetchRoadRouteDetails({ lat: 12.97, lng: 77.64 }, { lat: 12.98, lng: 77.645 }),
      fetchRoadRouteDetails({ lat: 12.97, lng: 77.64 }, { lat: 12.98, lng: 77.645 }),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first.routeStatus).toBe('READY');
    expect(first.distanceLabel).toBe('4.2 km');
    expect(first.steps).toHaveLength(2);
    expect(first.steps[1].instruction).toBe('Turn right onto Main Road');
    expect(second.coordinates).toHaveLength(3);
  });

  test('calculateNavigationGuidance splits travelled vs remaining geometry, matches steps, filters GPS noise, and detects arrival', () => {
    const polyline: [number, number][] = [
      [12.97, 77.64],
      [12.975, 77.64],
      [12.98, 77.64],
    ];
    const steps = [
      {
        maneuver: 'STRAIGHT',
        instruction: 'Continue onto 100ft Rd',
        streetName: '100ft Rd',
        distanceMeters: 555,
        durationSeconds: 90,
        startLocation: { latitude: 12.97, longitude: 77.64 },
        endLocation: { latitude: 12.975, longitude: 77.64 },
        coordinates: [
          [12.97, 77.64],
          [12.975, 77.64],
        ] as [number, number][],
      },
      {
        maneuver: 'TURN_RIGHT',
        instruction: 'Turn right onto Main Road',
        streetName: 'Main Road',
        distanceMeters: 555,
        durationSeconds: 90,
        startLocation: { latitude: 12.975, longitude: 77.64 },
        endLocation: { latitude: 12.98, longitude: 77.64 },
        coordinates: [
          [12.975, 77.64],
          [12.98, 77.64],
        ] as [number, number][],
      },
    ];

    const early = calculateNavigationGuidance({
      routeCoordinates: polyline,
      steps,
      currentPos: { lat: 12.9725, lng: 77.64 },
      totalDistanceMeters: 1110,
      totalDurationMinutes: 4,
      accuracyMeters: 12,
    });
    expect(early.currentStepIndex).toBe(0);
    expect(early.nextStep?.streetName).toBe('Main Road');
    expect(early.travelledCoordinates.length).toBeGreaterThanOrEqual(2);
    expect(early.remainingCoordinates.length).toBeGreaterThanOrEqual(2);
    expect(early.isOffRoute).toBe(false);

    // Poor accuracy spike (>80m) must NOT falsely trigger off-route rerouting
    const noisySpike = calculateNavigationGuidance({
      routeCoordinates: polyline,
      steps,
      currentPos: { lat: 12.975, lng: 77.643 },
      totalDistanceMeters: 1110,
      totalDurationMinutes: 4,
      accuracyMeters: 180,
    });
    expect(noisySpike.isOffRoute).toBe(false);

    // Accurate deviation >65m triggers off-route detection cleanly
    const offRoute = calculateRouteProgress(polyline, { lat: 12.975, lng: 77.643 }, 1110, 4);
    expect(offRoute.isOffRoute).toBe(true);

    const arrived = calculateRouteProgress(polyline, { lat: 12.98, lng: 77.64 }, 1110, 4);
    expect(arrived.hasArrived).toBe(true);
    expect(arrived.remainingDurationMinutes).toBe(0);
    expect(arrived.progressRatio).toBe(1);
  });

  test('bearing smoothing, ahead camera offset, maneuver icons, and voice deduplication behave deterministically', () => {
    const north = computeBearingDegrees({ lat: 12.97, lng: 77.64 }, { lat: 12.98, lng: 77.64 });
    expect(Math.round(north)).toBe(0);
    const wrapped = smoothBearingDegrees(350, 10, 0.5);
    expect(Math.round(wrapped)).toBe(0);

    const ahead = offsetCoordinateAhead({ lat: 12.97, lng: 77.64 }, 0, 100);
    expect(ahead.lat).toBeGreaterThan(12.97);

    expect(getManeuverIconName('TURN_LEFT')).toBe('corner-up-left');
    expect(getManeuverIconName('TURN_RIGHT')).toBe('corner-up-right');
    expect(getManeuverIconName('UTURN_LEFT')).toBe('rotate-ccw');
    expect(getManeuverIconName('ROUNDABOUT_RIGHT')).toBe('git-fork');

    const speakSpy = jest.spyOn(voiceNavigationService, 'speak').mockImplementation(() => {});
    voiceNavigationService.announceManeuver({
      stepIndex: 0,
      instruction: 'Turn left onto Main Road',
      distanceToManeuverMeters: 250,
    });
    voiceNavigationService.announceManeuver({
      stepIndex: 0,
      instruction: 'Turn left onto Main Road',
      distanceToManeuverMeters: 230,
    });
    expect(speakSpy).toHaveBeenCalledTimes(1);

    voiceNavigationService.setMuted(true);
    voiceNavigationService.announceManeuver({
      stepIndex: 0,
      instruction: 'Turn left onto Main Road',
      distanceToManeuverMeters: 50,
    });
    expect(speakSpy).toHaveBeenCalledTimes(1);
  });

  test('useLocationStore distinguishes permission denied, disabled services, poor accuracy, and ready state with clean messages', async () => {
    jest.spyOn(permissionService, 'check').mockResolvedValueOnce('denied');
    await useLocationStore.getState().refreshLocationState({ requestPermission: false });
    expect(useLocationStore.getState().gpsState).toBe('PERMISSION_DENIED');
    expect(useLocationStore.getState().errorMessage).toBe('Allow location access to go online.');

    jest.spyOn(permissionService, 'check').mockResolvedValue('granted');
    (globalThis as any).navigator = {
      geolocation: {
        getCurrentPosition: (_ok: any, errCb: any) => errCb({ code: 2 }),
      },
    };
    await useLocationStore.getState().refreshLocationState({ requestPermission: false });
    expect(useLocationStore.getState().gpsState).toBe('SERVICES_DISABLED');
    expect(useLocationStore.getState().errorMessage).toBe('Turn on location services to continue.');

    (globalThis as any).navigator = {
      geolocation: {
        getCurrentPosition: (okCb: any) =>
          okCb({
            coords: { latitude: 12.9716, longitude: 77.6412, accuracy: 220 },
            timestamp: Date.now(),
          }),
      },
    };
    await useLocationStore.getState().refreshLocationState({ requestPermission: false });
    expect(useLocationStore.getState().gpsState).toBe('POOR_ACCURACY');
    expect(useLocationStore.getState().errorMessage).toBe(
      'GPS signal is weak. Try again in an open area.',
    );

    (globalThis as any).navigator = {
      geolocation: {
        getCurrentPosition: (okCb: any) =>
          okCb({
            coords: { latitude: 12.9716, longitude: 77.6412, accuracy: 18 },
            timestamp: Date.now(),
          }),
      },
    };
    await useLocationStore.getState().refreshLocationState({ requestPermission: false });
    expect(useLocationStore.getState().gpsState).toBe('READY');
    expect(useLocationStore.getState().errorMessage).toBeNull();
  });

  test('InAppMapScreen provides separate Route Preview and Active Navigation HUD without legacy buttons', () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, '../features/map/InAppMapScreen.tsx'),
      'utf8',
    );
    expect(src).not.toContain('Refresh GPS');
    expect(src).not.toContain('Center Route');
    expect(src).toContain('Start Navigation');
    expect(src).toContain('Center map on current location');
    expect(src).toContain('navInstructionWrap');
    expect(src).toContain('navBottomPanel');
  });
});
