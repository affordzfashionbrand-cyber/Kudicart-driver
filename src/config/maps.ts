/**
 * KudiCart Driver App - Map Provider Configuration
 * 
 * Standard map provider configuration adhering to:
 * - AGENTS.md § 4: Google Maps Platform (D-021)
 * - SPEC.md § 3: Directions display and navigation
 * 
 * In web preview mode, Google Maps standard road tiles are used as primary provider
 * with OpenStreetMap as seamless fallback, avoiding third-party commercial token blocks.
 */

export const MAPS_CONFIG = {
  provider: 'google',

  // Primary: Google Maps Platform standard road tiles
  googleTilesUrl: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  googleSubdomains: ['mt0', 'mt1', 'mt2', 'mt3'],

  // Fallback: OpenStreetMap standard tiles (unmetered, open)
  osmTilesUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',

  // Runtime coordinates and road geometry are resolved from the order & Routes API
  defaultHub: null as { name: string; lat: number; lng: number } | null,
  defaultDestination: null as { name: string; lat: number; lng: number } | null,
  defaultRouteWaypoints: [] as [number, number][],

  routeColor: '#FF5A1F', // Brand Signal Orange
  routeWidth: 5,
};
