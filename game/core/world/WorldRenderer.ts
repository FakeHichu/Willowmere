import Phaser from 'phaser';
import { TerrainTileset, TerrainTileData } from './TerrainTileset';
import {
  WORLD_BOUNDS,
  TILE_SIZE,
  getTerrainAtPosition,
  isPathAtPosition,
  worldToTile,
} from '@data/world/worldMap';
import {
  CHUNK_SIZE,
  WORLD_GRID_COLS,
  WORLD_GRID_ROWS,
  generateWorldChunks,
  WorldChunk,
} from '@data/world/chunks';
import { terrainDefinitions, TerrainType } from '@data/world/terrain';
import { regions, getRegionAtPosition } from '@data/world/regions';
import { DepthManager, DepthLayer } from './DepthManager';

export interface ChunkLayerData {
  chunk: WorldChunk;
  tilemap: Phaser.Tilemaps.Tilemap;
  layers: Map<string, Phaser.Tilemaps.TilemapLayer>;
}

export class WorldRenderer {
  private scene: Phaser.Scene;
  private terrainTileset: TerrainTileset;
  private chunks: WorldChunk[] = [];
  private activeChunkLayers: Map<string, ChunkLayerData> = new Map();
  private chunkPool: ChunkLayerData[] = [];
  private maxActiveChunks = 16;
  private cameraViewPadding = 800;

  private layerNames = [
    'layer_terrain_base',
    'layer_terrain_transition',
    'layer_water',
    'layer_paths',
    'layer_ground_detail',
    'layer_props',
    'layer_entities',
    'layer_foreground',
  ];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.terrainTileset = new TerrainTileset(scene);
  }

  async create(): Promise<void> {
    this.terrainTileset.generateAtlas();
    this.chunks = generateWorldChunks();
  }

  updateCameraView(camera: Phaser.Cameras.Scene2D.Camera): void {
    const camX = camera.scrollX;
    const camY = camera.scrollY;
    const camWidth = camera.width / camera.zoom;
    const camHeight = camera.height / camera.zoom;

    const minX = camX - this.cameraViewPadding;
    const maxX = camX + camWidth + this.cameraViewPadding;
    const minY = camY - this.cameraViewPadding;
    const maxY = camY + camHeight + this.cameraViewPadding;

    const chunksToLoad: WorldChunk[] = [];

    for (const chunk of this.chunks) {
      if (chunk.bounds.x + chunk.bounds.width < minX ||
          chunk.bounds.x > maxX ||
          chunk.bounds.y + chunk.bounds.height < minY ||
          chunk.bounds.y > maxY) {
        continue;
      }
      chunksToLoad.push(chunk);
    }

    this.loadChunks(chunksToLoad);
    this.unloadChunks(minX, maxX, minY, maxY);
  }

  private loadChunks(chunksToLoad: WorldChunk[]): void {
    for (const chunk of chunksToLoad) {
      if (this.activeChunkLayers.has(chunk.id)) continue;

      if (this.activeChunkLayers.size >= this.maxActiveChunks) {
        this.unloadOldestChunk();
      }

      const layerData = this.createChunkTilemap(chunk);
      this.activeChunkLayers.set(chunk.id, layerData);
      chunk.isLoaded = true;
    }
  }

  private createChunkTilemap(chunk: WorldChunk): ChunkLayerData {
    let layerData: ChunkLayerData;

    if (this.chunkPool.length > 0) {
      layerData = this.chunkPool.pop()!;
      layerData.chunk = chunk;
      layerData.tilemap.destroy();
      layerData.layers.forEach(layer => layer.destroy());
      layerData.layers.clear();
    } else {
      layerData = {
        chunk,
        tilemap: null as unknown as Phaser.Tilemaps.Tilemap,
        layers: new Map(),
      };
    }

    const tilesX = Math.ceil(chunk.bounds.width / TILE_SIZE);
    const tilesY = Math.ceil(chunk.bounds.height / TILE_SIZE);

    const map = this.scene.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: tilesX,
      height: tilesY,
    });

    const atlasKey = this.terrainTileset.getAtlasKey();
    const tileset = map.addTilesetImage(atlasKey, atlasKey, TILE_SIZE, TILE_SIZE, 0, 0);

    if (!tileset) {
      console.error('[WorldRenderer] Terrain tileset not found for chunk:', chunk.id);
    }

    for (const layerName of this.layerNames) {
      const layer = map.createBlankLayer(layerName, tileset ? [tileset] : [], 0, 0);
      if (layer) {
        layer.setDepth(this.getLayerDepth(layerName));
        layerData.layers.set(layerName, layer);
      }
    }

    const baseLayer = layerData.layers.get('layer_terrain_base');
    const transitionLayer = layerData.layers.get('layer_terrain_transition');
    const waterLayer = layerData.layers.get('layer_water');
    const pathLayer = layerData.layers.get('layer_paths');
    const detailLayer = layerData.layers.get('layer_ground_detail');

    if (baseLayer) this.fillBaseTerrainLayer(baseLayer, chunk);
    if (transitionLayer) this.fillTransitionLayer(transitionLayer, chunk);
    if (waterLayer) this.fillWaterLayer(waterLayer, chunk);
    if (pathLayer) this.fillPathLayer(pathLayer, chunk);
    if (detailLayer) this.fillDetailLayer(detailLayer, chunk);

    layerData.tilemap = map;
    this.positionLayers(layerData, chunk.bounds.x, chunk.bounds.y);

    return layerData;
  }

  private getLayerDepth(layerName: string): number {
    const depths: Record<string, number> = {
      'layer_terrain_base': DepthLayer.BACKGROUND_TERRAIN,
      'layer_terrain_transition': DepthLayer.GROUND_DETAILS,
      'layer_water': DepthLayer.WATER_SURFACE,
      'layer_paths': DepthLayer.PATHS_AND_ROADS,
      'layer_ground_detail': DepthLayer.GROUND_DECORATIONS,
      'layer_props': DepthLayer.GROUND_OBJECTS,
      'layer_entities': DepthLayer.DYNAMIC_ENTITIES_BASE,
      'layer_foreground': DepthLayer.FOREGROUND_CANOPY,
    };
    return depths[layerName] || DepthLayer.BACKGROUND_TERRAIN;
  }

  private positionLayers(layerData: ChunkLayerData, x: number, y: number): void {
    layerData.layers.forEach(layer => {
      layer.setPosition(x, y);
    });
  }

  private fillBaseTerrainLayer(layer: Phaser.Tilemaps.TilemapLayer, chunk: WorldChunk): void {
    const widthInTiles = layer.width;
    const heightInTiles = layer.height;
    const chunkWorldX = chunk.bounds.x;
    const chunkWorldY = chunk.bounds.y;

    for (let y = 0; y < heightInTiles; y++) {
      for (let x = 0; x < widthInTiles; x++) {
        const worldX = chunkWorldX + x * TILE_SIZE + TILE_SIZE / 2;
        const worldY = chunkWorldY + y * TILE_SIZE + TILE_SIZE / 2;
        const terrainType = getTerrainAtPosition(worldX, worldY);

        const frameIndex = this.terrainTileset.getFrameIndex(terrainType);
        const variant = this.getDeterministicVariant(worldX, worldY, this.terrainTileset.getVariants(terrainType));
        layer.putTileAt(frameIndex + variant, x, y, true);
      }
    }
  }

  private fillTransitionLayer(layer: Phaser.Tilemaps.TilemapLayer, chunk: WorldChunk): void {
    const widthInTiles = layer.width;
    const heightInTiles = layer.height;
    const chunkWorldX = chunk.bounds.x;
    const chunkWorldY = chunk.bounds.y;

    for (let y = 0; y < heightInTiles; y++) {
      for (let x = 0; x < widthInTiles; x++) {
        const worldX = chunkWorldX + x * TILE_SIZE + TILE_SIZE / 2;
        const worldY = chunkWorldY + y * TILE_SIZE + TILE_SIZE / 2;

        const transitionType = this.getTransitionType(worldX, worldY);
        if (transitionType) {
          const frameIndex = this.terrainTileset.getFrameIndex(transitionType);
          layer.putTileAt(frameIndex, x, y, true);
        }
      }
    }
  }

  private getTransitionType(worldX: number, worldY: number): string | null {
    const currentTerrain = getTerrainAtPosition(worldX, worldY);
    const neighbors = [
      { dx: 0, dy: -TILE_SIZE },
      { dx: 0, dy: TILE_SIZE },
      { dx: -TILE_SIZE, dy: 0 },
      { dx: TILE_SIZE, dy: 0 },
    ];

    for (const n of neighbors) {
      const neighborTerrain = getTerrainAtPosition(worldX + n.dx, worldY + n.dy);
      if (neighborTerrain !== currentTerrain && this.canTransition(currentTerrain, neighborTerrain)) {
        const key = `${currentTerrain}_${neighborTerrain}`;
        if (this.terrainTileset.getTileData(key)) return key;
        const reverseKey = `${neighborTerrain}_${currentTerrain}`;
        if (this.terrainTileset.getTileData(reverseKey)) return reverseKey;
      }
    }
    return null;
  }

  private canTransition(from: TerrainType, to: TerrainType): boolean {
    const rules = terrainDefinitions[from]?.name;
    return true;
  }

  private fillWaterLayer(layer: Phaser.Tilemaps.TilemapLayer, chunk: WorldChunk): void {
    const widthInTiles = layer.width;
    const heightInTiles = layer.height;
    const chunkWorldX = chunk.bounds.x;
    const chunkWorldY = chunk.bounds.y;

    for (let y = 0; y < heightInTiles; y++) {
      for (let x = 0; x < widthInTiles; x++) {
        const worldX = chunkWorldX + x * TILE_SIZE + TILE_SIZE / 2;
        const worldY = chunkWorldY + y * TILE_SIZE + TILE_SIZE / 2;
        const terrainType = getTerrainAtPosition(worldX, worldY);

        if (terrainType === 'shallow_water' || terrainType === 'deep_water' || terrainType === 'river') {
          const frameIndex = this.terrainTileset.getFrameIndex(terrainType);
          layer.putTileAt(frameIndex, x, y, true);
        }
      }
    }
  }

  private fillPathLayer(layer: Phaser.Tilemaps.TilemapLayer, chunk: WorldChunk): void {
    const widthInTiles = layer.width;
    const heightInTiles = layer.height;
    const chunkWorldX = chunk.bounds.x;
    const chunkWorldY = chunk.bounds.y;

    for (let y = 0; y < heightInTiles; y++) {
      for (let x = 0; x < widthInTiles; x++) {
        const worldX = chunkWorldX + x * TILE_SIZE + TILE_SIZE / 2;
        const worldY = chunkWorldY + y * TILE_SIZE + TILE_SIZE / 2;

        if (isPathAtPosition(worldX, worldY)) {
          const frameIndex = this.terrainTileset.getFrameIndex('path');
          layer.putTileAt(frameIndex, x, y, true);
        }
      }
    }
  }

  private fillDetailLayer(layer: Phaser.Tilemaps.TilemapLayer, chunk: WorldChunk): void {
    const widthInTiles = layer.width;
    const heightInTiles = layer.height;
    const chunkWorldX = chunk.bounds.x;
    const chunkWorldY = chunk.bounds.y;

    for (let y = 0; y < heightInTiles; y++) {
      for (let x = 0; x < widthInTiles; x++) {
        const worldX = chunkWorldX + x * TILE_SIZE + TILE_SIZE / 2;
        const worldY = chunkWorldY + y * TILE_SIZE + TILE_SIZE / 2;
        const terrainType = getTerrainAtPosition(worldX, worldY);

        const detailChance = this.getDetailChance(terrainType);
        if (Math.random() < detailChance) {
          const detailType = this.getDetailType(terrainType);
          if (detailType) {
            const frameIndex = this.terrainTileset.getFrameIndex(detailType);
            layer.putTileAt(frameIndex, x, y, true);
          }
        }
      }
    }
  }

  private getDetailChance(terrainType: TerrainType): number {
    const chances: Record<TerrainType, number> = {
      grass: 0.08,
      dirt: 0.05,
      forest_floor: 0.12,
      stone: 0.03,
      sand: 0.06,
      mud: 0.08,
      shallow_water: 0.02,
      deep_water: 0,
      river: 0,
      cliff: 0,
      mountain: 0.04,
      farmland: 0.06,
      ruins: 0.1,
      cave_floor: 0.03,
      path: 0,
      bridge: 0,
      snow: 0.05,
    };
    return chances[terrainType] || 0;
  }

  private getDetailType(terrainType: TerrainType): string | null {
    const details: Record<TerrainType, string[]> = {
      grass: ['grass_flower', 'grass_rock', 'grass_bush'],
      dirt: ['dirt_rock', 'dirt_patch'],
      forest_floor: ['forest_mushroom', 'forest_log', 'forest_fern'],
      stone: ['stone_crack', 'stone_pebble'],
      sand: ['sand_shell', 'sand_rock'],
      mud: ['mud_puddle', 'mud_reed'],
      shallow_water: [],
      deep_water: [],
      river: [],
      cliff: [],
      mountain: ['mountain_rock', 'mountain_scree'],
      farmland: ['farm_crop', 'farm_rock'],
      ruins: ['ruins_pillar', 'ruins_rubble'],
      cave_floor: ['cave_stalagmite', 'cave_crystal'],
      path: [],
      bridge: [],
      snow: ['snow_rock', 'snow_drift'],
    };
    const list = details[terrainType];
    if (!list || list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  private getDeterministicVariant(worldX: number, worldY: number, maxVariants: number): number {
    const seed = Math.floor(worldX / 128) * 10000 + Math.floor(worldY / 128);
    const val = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return Math.floor((val - Math.floor(val)) * maxVariants);
  }

  private unloadChunks(minX: number, maxX: number, minY: number, maxY: number): void {
    const toUnload: string[] = [];

    for (const [chunkId, layerData] of this.activeChunkLayers) {
      const chunk = layerData.chunk;
      if (chunk.bounds.x + chunk.bounds.width < minX ||
          chunk.bounds.x > maxX ||
          chunk.bounds.y + chunk.bounds.height < minY ||
          chunk.bounds.y > maxY) {
        toUnload.push(chunkId);
      }
    }

    for (const chunkId of toUnload) {
      this.unloadChunk(chunkId);
    }
  }

  private unloadChunk(chunkId: string): void {
    const layerData = this.activeChunkLayers.get(chunkId);
    if (!layerData) return;

    layerData.layers.forEach(layer => layer.destroy());
    layerData.tilemap.destroy();
    layerData.layers.clear();

    layerData.chunk.isLoaded = false;
    this.chunkPool.push(layerData);
    this.activeChunkLayers.delete(chunkId);
  }

  private unloadOldestChunk(): void {
    const firstKey = this.activeChunkLayers.keys().next().value;
    if (firstKey) {
      this.unloadChunk(firstKey);
    }
  }

  getTerrainAtPosition(worldX: number, worldY: number): TerrainType {
    return getTerrainAtPosition(worldX, worldY);
  }

  getRegionAtPosition(worldX: number, worldY: number) {
    return getRegionAtPosition({ x: worldX, y: worldY });
  }

  worldToTile(worldX: number, worldY: number) {
    return worldToTile({ x: worldX, y: worldY });
  }

  tileToWorld(tileX: number, tileY: number) {
    return {
      x: tileX * TILE_SIZE + TILE_SIZE / 2,
      y: tileY * TILE_SIZE + TILE_SIZE / 2,
    };
  }

  getActiveChunkCount(): number {
    return this.activeChunkLayers.size;
  }

  getChunkLayerData(chunkId: string): ChunkLayerData | undefined {
    return this.activeChunkLayers.get(chunkId);
  }

  destroy(): void {
    for (const layerData of this.activeChunkLayers.values()) {
      layerData.layers.forEach(layer => layer.destroy());
      layerData.tilemap.destroy();
    }
    this.activeChunkLayers.clear();

    for (const layerData of this.chunkPool) {
      layerData.layers.forEach(layer => layer.destroy());
      layerData.tilemap.destroy();
    }
    this.chunkPool = [];

    this.terrainTileset.destroy();
  }
}