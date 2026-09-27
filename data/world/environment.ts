import type { WeatherType, TimeOfDay } from '@shared/types';
import type { WeatherAffinity } from './regions';

export interface EnvironmentProfile {
  id: string;
  regionId: string;
  weatherAffinity: WeatherAffinity;
  defaultWeather: WeatherType;
  allowedWeathers: WeatherType[];
  lightingProfiles: Record<TimeOfDay, {
    color: string;
    intensity: number;
    shadowAlpha: number;
    fogDensity: number;
  }>;
  ambientAudioTrack: string;
  particlePreset?: string;
}

export const environmentProfiles: Record<string, EnvironmentProfile> = {
  village: {
    id: 'env_village',
    regionId: 'village',
    weatherAffinity: 'temperate',
    defaultWeather: 'clear',
    allowedWeathers: ['clear', 'cloudy', 'rain', 'fog'],
    lightingProfiles: {
      morning: { color: '#fff3e0', intensity: 0.9, shadowAlpha: 0.25, fogDensity: 0.1 },
      day: { color: '#ffffff', intensity: 1.0, shadowAlpha: 0.2, fogDensity: 0.05 },
      evening: { color: '#ffb74d', intensity: 0.75, shadowAlpha: 0.4, fogDensity: 0.2 },
      night: { color: '#1a237e', intensity: 0.35, shadowAlpha: 0.6, fogDensity: 0.3 },
    },
    ambientAudioTrack: 'village_ambience',
  },
  riverside: {
    id: 'env_riverside',
    regionId: 'riverside',
    weatherAffinity: 'riverside',
    defaultWeather: 'clear',
    allowedWeathers: ['clear', 'rain', 'fog', 'storm'],
    lightingProfiles: {
      morning: { color: '#e3f2fd', intensity: 0.95, shadowAlpha: 0.2, fogDensity: 0.15 },
      day: { color: '#ffffff', intensity: 1.0, shadowAlpha: 0.2, fogDensity: 0.05 },
      evening: { color: '#ffccbc', intensity: 0.8, shadowAlpha: 0.35, fogDensity: 0.2 },
      night: { color: '#0d47a1', intensity: 0.3, shadowAlpha: 0.6, fogDensity: 0.35 },
    },
    ambientAudioTrack: 'river_flow_ambience',
    particlePreset: 'water_spray',
  },
  whispering_woods: {
    id: 'env_whispering_woods',
    regionId: 'whispering_woods',
    weatherAffinity: 'forest',
    defaultWeather: 'fog',
    allowedWeathers: ['clear', 'cloudy', 'rain', 'fog', 'storm'],
    lightingProfiles: {
      morning: { color: '#c8e6c9', intensity: 0.8, shadowAlpha: 0.35, fogDensity: 0.4 },
      day: { color: '#a5d6a7', intensity: 0.85, shadowAlpha: 0.3, fogDensity: 0.25 },
      evening: { color: '#8d6e63', intensity: 0.6, shadowAlpha: 0.5, fogDensity: 0.45 },
      night: { color: '#1b5e20', intensity: 0.2, shadowAlpha: 0.7, fogDensity: 0.6 },
    },
    ambientAudioTrack: 'forest_wind_ambience',
    particlePreset: 'falling_leaves',
  },
  northern_mountains: {
    id: 'env_northern_mountains',
    regionId: 'northern_mountains',
    weatherAffinity: 'mountain',
    defaultWeather: 'snow',
    allowedWeathers: ['clear', 'cloudy', 'snow', 'fog', 'storm'],
    lightingProfiles: {
      morning: { color: '#e0f7fa', intensity: 0.9, shadowAlpha: 0.2, fogDensity: 0.3 },
      day: { color: '#ffffff', intensity: 1.0, shadowAlpha: 0.25, fogDensity: 0.15 },
      evening: { color: '#b2ebf2', intensity: 0.7, shadowAlpha: 0.4, fogDensity: 0.4 },
      night: { color: '#1a2a3a', intensity: 0.25, shadowAlpha: 0.65, fogDensity: 0.5 },
    },
    ambientAudioTrack: 'mountain_wind_ambience',
    particlePreset: 'falling_snow',
  },
  cave_underground: {
    id: 'env_cave_underground',
    regionId: 'cave_underground',
    weatherAffinity: 'cavern',
    defaultWeather: 'clear',
    allowedWeathers: ['clear'],
    lightingProfiles: {
      morning: { color: '#1a1a24', intensity: 0.15, shadowAlpha: 0.8, fogDensity: 0.5 },
      day: { color: '#1a1a24', intensity: 0.15, shadowAlpha: 0.8, fogDensity: 0.5 },
      evening: { color: '#1a1a24', intensity: 0.15, shadowAlpha: 0.8, fogDensity: 0.5 },
      night: { color: '#0a0a10', intensity: 0.1, shadowAlpha: 0.9, fogDensity: 0.6 },
    },
    ambientAudioTrack: 'cave_drip_ambience',
    particlePreset: 'glowing_dust',
  },
};

export function getEnvironmentProfile(regionId: string): EnvironmentProfile {
  return environmentProfiles[regionId] || environmentProfiles.village;
}
