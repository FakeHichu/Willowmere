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

export class WorldRenderer {
  private scene: Phaser.Scene;
  private terrainLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private pathLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private detailLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private tilemap: Phaser.Tilemaps.Tilemap | null = null;
  private terrainTilesetTexture?: Phaser.Textures.Texture;
  private pathTexture?: Phaser.Textures.Texture;
  private generatedTextures = false;

  // Terrain type to tile index mapping (matches the order in the combined texture)
  private readonly terrainTypes: TerrainType[] = [
    'grass', 'dirt', 'forest_floor', 'stone', 'sand',
    'shallow_water', 'deep_water', 'mountain', 'farmland',
    'ruins', 'cave_floor', 'path', 'bridge',
  ];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  async create(): Promise<void> {
    this.generateTerrainTextures();
    this.createTilemap();
    this.createLayers();
  }

private generateTerrainTextures(): void {
    if (this.generatedTextures) return;

    // Create a combined texture atlas with all terrain types as frames
    // Each frame is TILE_SIZE x TILE_SIZE, arranged in a grid
    const cols = 7;
    const rows = Math.ceil(this.terrainTypes.length / cols);
    const atlasWidth = cols * TILE_SIZE;
    const atlasHeight = rows * TILE_SIZE;

    const graphics = this.scene.add.graphics({ x: 0, y: 0 });

    // Draw each terrain type into the atlas
    this.terrainTypes.forEach((type, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      const def = terrainDefinitions[type];
      graphics.fillStyle(def.color, 1);
      graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);

      // Add variation
      this.addTerrainVariationToAtlas(graphics, type, x, y);
    });

    // Generate the combined texture
    const textureKey = 'terrain_atlas';
    graphics.generateTexture(textureKey, atlasWidth, atlasHeight);
    this.terrainTilesetTexture = this.scene.textures.get(textureKey);
    graphics.destroy();

    // Create path texture
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
    
    // Add frame for path texture
    const texture = this.scene.textures.get(textureKey);
    if (texture) {
      texture.add('path', 0, 0, 0, TILE_SIZE, TILE_SIZE);
      texture.add('0', 0, 0, 0, TILE_SIZE, TILE_SIZE);
    }
    
    graphics.destroy();
  }

  private createTilemap(): void {
    const map = this.scene.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: WORLD_BOUNDS.width / TILE_SIZE,
      height: WORLD_BOUNDS.height / TILE_SIZE,
    });

    this.tilemap = map;

    // Add the combined terrain atlas as a single tileset FIRST
    // We need to specify tileWidth/tileHeight so Phaser knows how to slice the atlas
    if (this.terrainTilesetTexture) {
      const tileset = map.addTilesetImage('terrain_atlas', this.terrainTilesetTexture.key, TILE_SIZE, TILE_SIZE, 0, 0);
      console.log('[WorldRenderer] Added terrain_atlas tileset:', tileset ? 'OK' : 'FAILED', '| tileset name:', tileset?.name, '| firstgid:', tileset?.firstgid);
    } else {
      console.error('[WorldRenderer] terrainTilesetTexture not available!');
    }

    if (this.pathTexture) {
      const tileset = map.addTilesetImage('terrain_path', this.pathTexture.key, TILE_SIZE, TILE_SIZE, 0, 0);
      console.log('[WorldRenderer] Added terrain_path tileset:', tileset ? 'OK' : 'FAILED', '| tileset name:', tileset?.name, '| firstgid:', tileset?.firstgid);
    }

    console.log('[WorldRenderer] Available tilesets after add:', map.tilesets.map(t => ({ name: t.name, firstgid: t.firstgid, tileWidth: t.tileWidth, tileHeight: t.tileHeight })));

    // Create layers AFTER tilesets are added
    this.createLayers();
  }

  private createLayers(): void {
    if (!this.tilemap) return;

    console.log('[WorldRenderer] All tilesets in map:', this.tilemap.tilesets.map(t => ({ name: t.name, firstgid: t.firstgid })));

    // Get the tilesets that were added
    const terrainTileset = this.tilemap.tilesets.find(t => t.name === 'terrain_atlas');
    const pathTileset = this.tilemap.tilesets.find(t => t.name === 'terrain_path');

    console.log('[WorldRenderer] Found terrain_atlas:', terrainTileset ? 'YES' : 'NO', '| object:', terrainTileset ? { name: terrainTileset.name, firstgid: terrainTileset.firstgid, columns: terrainTileset.columns } : null);
    console.log('[WorldRenderer] Found terrain_path:', pathTileset ? 'YES' : 'NO', '| object:', pathTileset ? { name: pathTileset.name, firstgid: pathTileset.firstgid } : null);

    if (!terrainTileset) {
      console.error('[WorldRenderer] Terrain tileset not found! Available:', this.tilemap.tilesets.map(t => t.name));
      // Try to use the first tileset as fallback
      const fallback = this.tilemap.tilesets[0];
      if (fallback) {
        console.log('[WorldRenderer] Using fallback tileset:', fallback.name);
      }
      return;
    }

    const terrainLayer = this.tilemap.createBlankLayer('Terrain', [terrainTileset], 0, 0);
    const pathLayer = pathTileset ? this.tilemap.createBlankLayer('Paths', [pathTileset], 0, 0) : null;
    const detailLayer = terrainTileset ? this.tilemap.createBlankLayer('Details', [terrainTileset], 0, 0) : null;

    console.log('[WorldRenderer] Created layers - Terrain:', terrainLayer ? 'OK' : 'FAILED', '| layer:', terrainLayer);
    console.log('[WorldRenderer] Created layers - Paths:', pathLayer ? 'OK' : 'FAILED', '| layer:', pathLayer);
    console.log('[WorldRenderer] Created layers - Details:', detailLayer ? 'OK' : 'FAILED', '| layer:', detailLayer);

    this.terrainLayer = terrainLayer;
    this.pathLayer = pathLayer;
    this.detailLayer = detailLayer;

    if (this.terrainLayer) {
      this.terrainLayer.setDepth(0);
      this.fillTerrainLayer(this.terrainLayer);
    }

    if (this.pathLayer) {
      this.pathLayer.setDepth(1);
      this.fillPathLayer(this.pathLayer);
    }

    if (this.detailLayer) {
      this.detailLayer.setDepth(2);
    }
  }

  private fillTerrainLayer(layer: Phaser.Tilemaps.TilemapLayer): void {
    const widthInTiles = layer.width;
    const heightInTiles = layer.height;

    for (let y = 0; y < heightInTiles; y++) {
      for (let x = 0; x < widthInTiles; x++) {
        const worldX = x * TILE_SIZE + TILE_SIZE / 2;
        const worldY = y * TILE_SIZE + TILE_SIZE / 2;
        const terrainType = getTerrainAtPosition(worldX, worldY);
        const tileIndex = this.terrainTypes.indexOf(terrainType);

        if (tileIndex >= 0) {
          layer.putTileAt(tileIndex, x, y, true);
        }
      }
    }
  }

  private fillPathLayer(layer: Phaser.Tilemaps.TilemapLayer): void {
    const widthInTiles = layer.width;
    const heightInTiles = layer.height;

    for (let y = 0; y < heightInTiles; y++) {
      for (let x = 0; x < widthInTiles; x++) {
        const worldX = x * TILE_SIZE + TILE_SIZE / 2;
        const worldY = y * TILE_SIZE + TILE_SIZE / 2;

        if (isPathAtPosition(worldX, worldY)) {
          // Path uses the path tileset, which has only 1 tile (index 0)
          layer.putTileAt(0, x, y, true);
        }
      }
    }
  }

  getTerrainLayer(): Phaser.Tilemaps.TilemapLayer | null {
    return this.terrainLayer;
  }

  getPathLayer(): Phaser.Tilemaps.TilemapLayer | null {
    return this.pathLayer;
  }

  getDetailLayer(): Phaser.Tilemaps.TilemapLayer | null {
    return this.detailLayer;
  }

  getTilemap(): Phaser.Tilemaps.Tilemap | null {
    return this.tilemap;
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

  destroy(): void {
    this.terrainLayer?.destroy();
    this.pathLayer?.destroy();
    this.detailLayer?.destroy();
    this.tilemap?.destroy();

    this.terrainTilesetTexture?.destroy();
    this.pathTexture?.destroy();
    this.generatedTextures = false;
  }
}