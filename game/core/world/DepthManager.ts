import Phaser from 'phaser';

export enum DepthLayer {
  BACKGROUND_TERRAIN = 0,
  GROUND_DETAILS = 10,
  PATHS_AND_ROADS = 20,
  WATER_SURFACE = 30,
  BRIDGES_AND_RAMPS = 40,
  GROUND_OBJECTS = 50,
  GROUND_DECORATIONS = 60,
  LOW_VEGETATION = 70,
  DYNAMIC_ENTITIES_BASE = 100,
  TREE_TRUNKS_AND_STRUCTURES = 200,
  HIGH_VEGETATION = 300,
  FOREGROUND_CANOPY = 500,
  WEATHER_EFFECTS = 1000,
  LIGHTING_OVERLAY = 2000,
  UI_AND_HUD = 3000,
  DEBUG_OVERLAY = 9999,
}

export interface DepthSortable {
  getDepth(): number;
  setDepth(depth: number): void;
  y: number;
}

type DepthCapable = Phaser.GameObjects.GameObject & { setDepth: (depth: number) => DepthCapable; y: number };

export class DepthManager {
  private static entityDepthCache = new Map<string, number>();

  static getEntityDepth(y: number, elevationLevel: number = 1, baseLayer: number = DepthLayer.DYNAMIC_ENTITIES_BASE): number {
    return baseLayer + elevationLevel * 1000 + Math.floor(y / 10);
  }

  static sortDepth(gameObject: DepthCapable, y: number, elevationLevel: number = 1): void {
    const depth = this.getEntityDepth(y, elevationLevel);
    gameObject.setDepth(depth);
  }

  static sortContainer(container: Phaser.GameObjects.Container, y: number, elevationLevel: number = 1): void {
    const depth = this.getEntityDepth(y, elevationLevel);
    container.setDepth(depth);
  }

  static getLayerDepth(layer: DepthLayer): number {
    return layer;
  }

  static getDepthForType(type: string, y: number): number {
    const baseDepths: Record<string, number> = {
      'terrain': DepthLayer.BACKGROUND_TERRAIN,
      'ground_detail': DepthLayer.GROUND_DETAILS,
      'path': DepthLayer.PATHS_AND_ROADS,
      'water': DepthLayer.WATER_SURFACE,
      'bridge': DepthLayer.BRIDGES_AND_RAMPS,
      'ground_object': DepthLayer.GROUND_OBJECTS,
      'ground_decoration': DepthLayer.GROUND_DECORATIONS,
      'low_vegetation': DepthLayer.LOW_VEGETATION,
      'entity': DepthLayer.DYNAMIC_ENTITIES_BASE,
      'tree_trunk': DepthLayer.TREE_TRUNKS_AND_STRUCTURES,
      'high_vegetation': DepthLayer.HIGH_VEGETATION,
      'canopy': DepthLayer.FOREGROUND_CANOPY,
      'weather': DepthLayer.WEATHER_EFFECTS,
      'lighting': DepthLayer.LIGHTING_OVERLAY,
      'ui': DepthLayer.UI_AND_HUD,
      'debug': DepthLayer.DEBUG_OVERLAY,
    };

    const base = baseDepths[type] || DepthLayer.DYNAMIC_ENTITIES_BASE;
    if (type === 'entity') {
      return this.getEntityDepth(y);
    }
    return base + Math.floor(y / 10000);
  }

  static registerEntity(id: string, gameObject: DepthCapable, y: number, elevationLevel: number = 1): void {
    const depth = this.getEntityDepth(y, elevationLevel);
    gameObject.setDepth(depth);
    this.entityDepthCache.set(id, depth);
  }

  static updateEntityDepth(id: string, gameObject: DepthCapable, y: number, elevationLevel: number = 1): void {
    const depth = this.getEntityDepth(y, elevationLevel);
    gameObject.setDepth(depth);
    this.entityDepthCache.set(id, depth);
  }

  static unregisterEntity(id: string): void {
    this.entityDepthCache.delete(id);
  }

  static getCachedDepth(id: string): number | undefined {
    return this.entityDepthCache.get(id);
  }

  static clearCache(): void {
    this.entityDepthCache.clear();
  }

  static createDepthSorter(): (a: DepthSortable, b: DepthSortable) => number {
    return (a, b) => a.getDepth() - b.getDepth();
  }
}

export class DepthSortedGroup {
  private scene: Phaser.Scene;
  private children: Map<string, { object: DepthCapable; elevationLevel: number }> = new Map();
  private baseDepth: number;

  constructor(scene: Phaser.Scene, baseDepth: number = DepthLayer.DYNAMIC_ENTITIES_BASE) {
    this.scene = scene;
    this.baseDepth = baseDepth;
  }

  add(id: string, object: DepthCapable, elevationLevel: number = 1): void {
    this.children.set(id, { object, elevationLevel });
    DepthManager.registerEntity(id, object, object.y, elevationLevel);
  }

  remove(id: string): void {
    this.children.delete(id);
    DepthManager.unregisterEntity(id);
  }

  updateDepths(): void {
    for (const [id, { object, elevationLevel }] of this.children) {
      DepthManager.updateEntityDepth(id, object, object.y, elevationLevel);
    }
  }

  get(id: string): DepthCapable | undefined {
    return this.children.get(id)?.object;
  }

  forEach(callback: (object: DepthCapable, id: string) => void): void {
    this.children.forEach(({ object }, id) => callback(object, id));
  }

  clear(): void {
    this.children.forEach(({ object }, id) => {
      DepthManager.unregisterEntity(id);
      object.destroy();
    });
    this.children.clear();
  }
}