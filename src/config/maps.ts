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

import { BENGALURU_ROAD_ROUTE } from '../services/routingService';

export const MAPS_CONFIG = {
  provider: 'google',
  
  // Primary: Google Maps Platform standard road tiles
  googleTilesUrl: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  googleSubdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  
  // Fallback: OpenStreetMap standard tiles (unmetered, open)
  osmTilesUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  
  // Default delivery coordinates: Bengaluru (Indiranagar Darkstore Hub to HAL 2nd Stage)
  defaultHub: {
    name: 'KudiCart Darkstore Hub #04 - Indiranagar',
    lat: 12.9719,
    lng: 77.6412,
  },
  defaultDestination: {
    name: 'Flat 402, Skyline Heights, 12th Main Road, HAL 2nd Stage',
    lat: 12.9658,
    lng: 77.6465,
  },
  
  // Verified road-following street geometry
  defaultRouteWaypoints: BENGALURU_ROAD_ROUTE,
  
  routeColor: '#FF5A1F', // Brand Signal Orange
  routeWidth: 5,
};
