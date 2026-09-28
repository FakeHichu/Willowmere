import type { PlayerExplorationState } from '@shared/types';
import { regions } from '@data/world/regions';
import { landmarks } from '@data/world/landmarks';

export interface ExplorationProgress {
  totalRegions: number;
  discoveredRegions: number;
  totalLandmarks: number;
  discoveredLandmarks: number;
  totalLocations: number;
  discoveredLocations: number;
  percentage: number;
}

export class ExplorationSystem {
  private scene: Phaser.Scene;
  private explorationState: PlayerExplorationState;
  private onDiscoveryCallbacks: Array<(type: 'region' | 'landmark' | 'location', id: string, name: string) => void> = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.explorationState = this.getDefaultState();
    this.loadState();
  }

  private getDefaultState(): PlayerExplorationState {
    return {
      discoveredRegions: ['village'],
      discoveredLandmarks: [],
      discoveredLocations: [],
      explorationPercentage: 0,
    };
  }

  private loadState(): void {
    try {
      const saved = localStorage.getItem('willowmere_exploration');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.explorationState = {
          discoveredRegions: parsed.discoveredRegions || ['village'],
          discoveredLandmarks: parsed.discoveredLandmarks || [],
          discoveredLocations: parsed.discoveredLocations || [],
          explorationPercentage: parsed.explorationPercentage || 0,
        };
      }
    } catch (e) {
      console.warn('[ExplorationSystem] Failed to load exploration state:', e);
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem('willowmere_exploration', JSON.stringify(this.explorationState));
    } catch (e) {
      console.warn('[ExplorationSystem] Failed to save exploration state:', e);
    }
  }

  private recalculatePercentage(): void {
    const totalRegions = regions.length;
    const discoveredRegions = this.explorationState.discoveredRegions.length;

    const totalLandmarks = landmarks.length;
    const discoveredLandmarks = this.explorationState.discoveredLandmarks.length;

    const totalLocations = totalRegions + totalLandmarks;
    const discoveredLocations = discoveredRegions + discoveredLandmarks;

    this.explorationState.explorationPercentage = totalLocations > 0
      ? Math.round((discoveredLocations / totalLocations) * 100)
      : 0;
  }

  discoverRegion(regionId: string): boolean {
    if (this.explorationState.discoveredRegions.includes(regionId)) {
      return false;
    }

    this.explorationState.discoveredRegions.push(regionId);
    this.recalculatePercentage();
    this.saveState();

    const region = regions.find(r => r.id === regionId);
    this.onDiscoveryCallbacks.forEach(cb => cb('region', regionId, region?.displayName || regionId));

    return true;
  }

  discoverLandmark(landmarkId: string): boolean {
    if (this.explorationState.discoveredLandmarks.includes(landmarkId)) {
      return false;
    }

    this.explorationState.discoveredLandmarks.push(landmarkId);
    this.recalculatePercentage();
    this.saveState();

    const landmark = landmarks.find(l => l.id === landmarkId);
    this.onDiscoveryCallbacks.forEach(cb => cb('landmark', landmarkId, landmark?.name || landmarkId));

    return true;
  }

  discoverLocation(locationId: string): boolean {
    if (this.explorationState.discoveredLocations.includes(locationId)) {
      return false;
    }

    this.explorationState.discoveredLocations.push(locationId);
    this.recalculatePercentage();
    this.saveState();

    this.onDiscoveryCallbacks.forEach(cb => cb('location', locationId, locationId));

    return true;
  }

  isRegionDiscovered(regionId: string): boolean {
    return this.explorationState.discoveredRegions.includes(regionId);
  }

  isLandmarkDiscovered(landmarkId: string): boolean {
    return this.explorationState.discoveredLandmarks.includes(landmarkId);
  }

  isLocationDiscovered(locationId: string): boolean {
    return this.explorationState.discoveredLocations.includes(locationId);
  }

  getProgress(): ExplorationProgress {
    const totalRegions = regions.length;
    const discoveredRegions = this.explorationState.discoveredRegions.length;
    const totalLandmarks = landmarks.length;
    const discoveredLandmarks = this.explorationState.discoveredLandmarks.length;
    const totalLocations = regions.length + landmarks.length;
    const discoveredLocations = this.explorationState.discoveredRegions.length + this.explorationState.discoveredLandmarks.length;

    return {
      totalRegions,
      discoveredRegions,
      totalLandmarks,
      discoveredLandmarks,
      totalLocations,
      discoveredLocations,
      percentage: this.explorationState.explorationPercentage,
    };
  }

  getState(): PlayerExplorationState {
    return { ...this.explorationState };
  }

  setState(state: Partial<PlayerExplorationState>): void {
    this.explorationState = { ...this.explorationState, ...state };
    this.recalculatePercentage();
    this.saveState();
  }

  onDiscovery(callback: (type: 'region' | 'landmark' | 'location', id: string, name: string) => void): void {
    this.onDiscoveryCallbacks.push(callback);
  }

  offDiscovery(callback: (type: 'region' | 'landmark' | 'location', id: string, name: string) => void): void {
    const idx = this.onDiscoveryCallbacks.indexOf(callback);
    if (idx >= 0) this.onDiscoveryCallbacks.splice(idx, 1);
  }

  getDiscoveredRegions(): string[] {
    return [...this.explorationState.discoveredRegions];
  }

  getDiscoveredLandmarks(): string[] {
    return [...this.explorationState.discoveredLandmarks];
  }

  getDiscoveredLocations(): string[] {
    return [...this.explorationState.discoveredLocations];
  }

  getExplorationPercentage(): number {
    return this.explorationState.explorationPercentage;
  }

  reset(): void {
    this.explorationState = this.getDefaultState();
    this.saveState();
  }

  destroy(): void {
    this.onDiscoveryCallbacks = [];
  }
}