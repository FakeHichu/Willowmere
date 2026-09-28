import Phaser from 'phaser';
import {
  WORLD_BOUNDS,
  TILE_SIZE,
  getTerrainAtPosition,
  isPathAtPosition,
  worldToTile,
} from '@data/world/worldMap';
import { terrainDefinitions, TerrainType } from '@data/world/terrain';
import { regions, getRegionAtPosition } from '@data/world/regions';
import { CHUNK_SIZE, WORLD_GRID_COLS, WORLD_GRID_ROWS, generateWorldChunks, WorldChunk } from '@data/world/chunks';

export interface ChunkTilemapData {
  chunk: WorldChunk;
  tilemap: Phaser.Tilemaps.Tilemap;
  terrainLayer: Phaser.Tilemaps.TilemapLayer;
  pathLayer: Phaser.Tilemaps.TilemapLayer | null;
  detailLayer: Phaser.Tilemaps.TilemapLayer | null;
}

export class WorldRenderer {
  private scene: Phaser.Scene;
  private terrainTilesetTexture?: Phaser.Textures.Texture;
  private pathTexture?: Phaser.Textures.Texture;
  private generatedTextures = false;

  private chunks: WorldChunk[] = [];
  private activeChunkTilemaps: Map<string, ChunkTilemapData> = new Map();
  private chunkPool: ChunkTilemapData[] = [];
  private maxActiveChunks = 16;

  private readonly terrainTypes: TerrainType[] = [
    'grass', 'dirt', 'forest_floor', 'stone', 'sand',
    'shallow_water', 'deep_water', 'mountain', 'farmland',
    'ruins', 'cave_floor', 'path', 'bridge',
  ];

  private cameraViewPadding = 800;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  async create(): Promise<void> {
    this.generateTerrainTextures();
    this.chunks = generateWorldChunks();
  }

  private generateTerrainTextures(): void {
    if (this.generatedTextures) return;

    const cols = 7;
    const rows = Math.ceil(this.terrainTypes.length / cols);
    const atlasWidth = cols * TILE_SIZE;
    const atlasHeight = rows * TILE_SIZE;

    const graphics = this.scene.add.graphics({ x: 0, y: 0 });

    this.terrainTypes.forEach((type, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      const def = terrainDefinitions[type];
      graphics.fillStyle(def.color, 1);
      graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      this.addTerrainVariationToAtlas(graphics, type, x, y);
    });

    const textureKey = 'terrain_atlas';
    graphics.generateTexture(textureKey, atlasWidth, atlasHeight);
    this.terrainTilesetTexture = this.scene.textures.get(textureKey);
    graphics.destroy();

    const texture = this.scene.textures.get(textureKey);
    if (texture) {
      const source = texture.getSourceImage() as HTMLCanvasElement;
      if (source) {
        this.terrainTypes.forEach((type, index) => {
          const col = index % 7;
          const row = Math.floor(index / 7);
          const x = col * TILE_SIZE;
          const y = row * TILE_SIZE;
          texture.add(index.toString(), 0, x, y, TILE_SIZE, TILE_SIZE);
        });
      }
    }

    this.createPathTexture();
    this.generatedTextures = true;
  }

  private addTerrainVariationToAtlas(
    graphics: Phaser.GameObjects.Graphics,
    type: TerrainType,
    baseX: number,
    baseY: number
  ): void {
    const variationCount = type === 'grass' ? 8 : type === 'forest_floor' ? 6 : 4;

    for (let i = 0; i < variationCount; i++) {
      const x = baseX + Phaser.Math.Between(2, TILE_SIZE - 4);
      const y = baseY + Phaser.Math.Between(2, TILE_SIZE - 4);
      const size = Phaser.Math.Between(2, 6);

      let variationColor: number;

      switch (type) {
        case 'grass':
          variationColor = Phaser.Math.RND.pick([0x689f38, 0x7cb342, 0x8bc34a, 0x558b2f]);
          break;
        case 'forest_floor':
          variationColor = Phaser.Math.RND.pick([0x4e342e, 0x5d4037, 0x6d4c41, 0x3e2723]);
          break;
        case 'dirt':
        case 'path':
          variationColor = Phaser.Math.RND.pick([0x795548, 0x8d6e63, 0xa1887f, 0x6d4c41]);
          break;
        case 'stone':
        case 'mountain':
        case 'ruins':
          variationColor = Phaser.Math.RND.pick([0x616161, 0x757575, 0x90a4ae, 0x455a64]);
          break;
        case 'sand':
          variationColor = Phaser.Math.RND.pick([0xe8d5b7, 0xf5e6c8, 0xfff3e0, 0xd7ccc8]);
          break;
        case 'shallow_water':
          variationColor = Phaser.Math.RND.pick([0x4fc3f7, 0x29b6f6, 0x03a9f4, 0x0288d1]);
          break;
        case 'farmland':
          variationColor = Phaser.Math.RND.pick([0x795548, 0x8d6e63, 0x6d4c41, 0x5d4037]);
          break;
        default:
          variationColor = Phaser.Display.Color.GetColor(
            Phaser.Math.Between(0, 255),
            Phaser.Math.Between(0, 255),
            Phaser.Math.Between(0, 255)
          );
      }

      graphics.fillStyle(variationColor, 0.3);
      graphics.fillCircle(x, y, size);
    }
  }

  private createPathTexture(): void {
    const textureKey = 'terrain_path';

    if (this.scene.textures.exists(textureKey)) {
      this.pathTexture = this.scene.textures.get(textureKey);
      return;
    }

    const graphics = this.scene.add.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x8d6e63, 1);
    graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(2, TILE_SIZE - 4);
      const y = Phaser.Math.Between(2, TILE_SIZE - 4);
      const size = Phaser.Math.Between(1, 4);
      graphics.fillStyle(0x795548, 0.4);
      graphics.fillCircle(x, y, size);
    }

    graphics.generateTexture(textureKey, TILE_SIZE, TILE_SIZE);
    this.pathTexture = this.scene.textures.get(textureKey);

    const texture = this.scene.textures.get(textureKey);
    if (texture) {
      texture.add('path', 0, 0, 0, TILE_SIZE, TILE_SIZE);
      texture.add('0', 0, 0, 0, TILE_SIZE, TILE_SIZE);
    }

    graphics.destroy();
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
      if (this.activeChunkTilemaps.has(chunk.id)) continue;

      if (this.activeChunkTilemaps.size >= this.maxActiveChunks) {
        this.unloadOldestChunk();
      }

      const tilemapData = this.createChunkTilemap(chunk);
      this.activeChunkTilemaps.set(chunk.id, tilemapData);
      chunk.isLoaded = true;
    }
  }

  private createChunkTilemap(chunk: WorldChunk): ChunkTilemapData {
    let tilemapData: ChunkTilemapData;

    if (this.chunkPool.length > 0) {
      tilemapData = this.chunkPool.pop()!;
      tilemapData.chunk = chunk;
      tilemapData.tilemap.destroy();
      tilemapData.terrainLayer?.destroy();
      tilemapData.pathLayer?.destroy();
      tilemapData.detailLayer?.destroy();
    } else {
      tilemapData = {
        chunk,
        tilemap: null as unknown as Phaser.Tilemaps.Tilemap,
        terrainLayer: null as unknown as Phaser.Tilemaps.TilemapLayer,
        pathLayer: null,
        detailLayer: null,
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

    if (this.terrainTilesetTexture) {
      map.addTilesetImage('terrain_atlas', this.terrainTilesetTexture.key, TILE_SIZE, TILE_SIZE, 0, 0);
    }
    if (this.pathTexture) {
      map.addTilesetImage('terrain_path', this.pathTexture.key, TILE_SIZE, TILE_SIZE, 0, 0);
    }

    const terrainTileset = map.tilesets.find(t => t.name === 'terrain_atlas');
    const pathTileset = map.tilesets.find(t => t.name === 'terrain_path');

    if (!terrainTileset) {
      console.error('[WorldRenderer] Terrain tileset not found for chunk:', chunk.id);
    }

    const terrainLayer = map.createBlankLayer('Terrain', terrainTileset ? [terrainTileset] : [], 0, 0);
    const pathLayer = pathTileset ? map.createBlankLayer('Paths', [pathTileset], 0, 0) : null;
    const detailLayer = terrainTileset ? map.createBlankLayer('Details', [terrainTileset], 0, 0) : null;

    if (terrainLayer) {
      terrainLayer.setDepth(0);
      this.fillTerrainLayer(terrainLayer, chunk);
    }
    if (pathLayer) {
      pathLayer.setDepth(1);
      this.fillPathLayer(pathLayer, chunk);
    }
    if (detailLayer) {
      detailLayer.setDepth(2);
    }

    tilemapData.tilemap = map;
    tilemapData.terrainLayer = terrainLayer!;
    tilemapData.pathLayer = pathLayer;
    tilemapData.detailLayer = detailLayer;

    if (terrainLayer) {
      terrainLayer.setPosition(chunk.bounds.x, chunk.bounds.y);
    }
    if (pathLayer) {
      pathLayer.setPosition(chunk.bounds.x, chunk.bounds.y);
    }
    if (detailLayer) {
      detailLayer.setPosition(chunk.bounds.x, chunk.bounds.y);
    }

    return tilemapData;
  }

  private fillTerrainLayer(layer: Phaser.Tilemaps.TilemapLayer, chunk: WorldChunk): void {
    const widthInTiles = layer.width;
    const heightInTiles = layer.height;
    const chunkWorldX = chunk.bounds.x;
    const chunkWorldY = chunk.bounds.y;

    for (let y = 0; y < heightInTiles; y++) {
      for (let x = 0; x < widthInTiles; x++) {
        const worldX = chunkWorldX + x * TILE_SIZE + TILE_SIZE / 2;
        const worldY = chunkWorldY + y * TILE_SIZE + TILE_SIZE / 2;
        const terrainType = getTerrainAtPosition(worldX, worldY);
        const tileIndex = this.terrainTypes.indexOf(terrainType);

        if (tileIndex >= 0) {
          layer.putTileAt(tileIndex, x, y, true);
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
          layer.putTileAt(0, x, y, true);
        }
      }
    }
  }

  private unloadChunks(minX: number, maxX: number, minY: number, maxY: number): void {
    const toUnload: string[] = [];

    for (const [chunkId, tilemapData] of this.activeChunkTilemaps) {
      const chunk = tilemapData.chunk;
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
    const tilemapData = this.activeChunkTilemaps.get(chunkId);
    if (!tilemapData) return;

    tilemapData.terrainLayer?.destroy();
    tilemapData.pathLayer?.destroy();
    tilemapData.detailLayer?.destroy();
    tilemapData.tilemap?.destroy();

    tilemapData.chunk.isLoaded = false;
    this.chunkPool.push(tilemapData);
    this.activeChunkTilemaps.delete(chunkId);
  }

  private unloadOldestChunk(): void {
    const firstKey = this.activeChunkTilemaps.keys().next().value;
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
    return this.activeChunkTilemaps.size;
  }

  getChunkTilemapData(chunkId: string): ChunkTilemapData | undefined {
    return this.activeChunkTilemaps.get(chunkId);
  }

  destroy(): void {
    for (const tilemapData of this.activeChunkTilemaps.values()) {
      tilemapData.terrainLayer?.destroy();
      tilemapData.pathLayer?.destroy();
      tilemapData.detailLayer?.destroy();
      tilemapData.tilemap?.destroy();
    }
    this.activeChunkTilemaps.clear();

    for (const tilemapData of this.chunkPool) {
      tilemapData.terrainLayer?.destroy();
      tilemapData.pathLayer?.destroy();
      tilemapData.detailLayer?.destroy();
      tilemapData.tilemap?.destroy();
    }
    this.chunkPool = [];

    this.terrainTilesetTexture?.destroy();
    this.pathTexture?.destroy();
    this.generatedTextures = false;
  }
}