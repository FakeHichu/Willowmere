import Phaser from 'phaser';
import { terrainDefinitions, TerrainType, TILE_SIZE } from '@data/world/terrain';

const TERRAIN_TYPES: TerrainType[] = [
  'grass', 'dirt', 'forest_floor', 'stone', 'sand', 'mud',
  'shallow_water', 'deep_water', 'river', 'cliff', 'mountain',
  'farmland', 'ruins', 'cave_floor', 'path', 'bridge', 'snow',
];

const TRANSITION_TYPES = [
  'grass_dirt', 'grass_forest', 'grass_path', 'grass_farmland', 'grass_sand', 'grass_mud', 'grass_snow',
  'dirt_stone', 'dirt_path', 'dirt_farmland', 'dirt_mud',
  'forest_stone', 'forest_ruins', 'forest_mud',
  'stone_mountain', 'stone_ruins', 'stone_bridge', 'stone_path', 'stone_cliff',
  'sand_shallow', 'sand_mud',
  'shallow_deep', 'shallow_river', 'shallow_bridge', 'shallow_mud',
  'river_deep', 'river_bridge',
  'mountain_snow', 'mountain_path', 'mountain_cliff',
  'farmland_dirt', 'farmland_path', 'farmland_mud',
  'ruins_forest', 'ruins_stone', 'ruins_cave',
  'cave_stone', 'cave_cliff',
  'path_bridge', 'bridge_stone',
];

export interface TerrainTileData {
  type: TerrainType | string;
  frameIndex: number;
  variants: number;
}

export class TerrainTileset {
  private scene: Phaser.Scene;
  private atlasKey = 'terrain_atlas';
  private tiles: Map<string, TerrainTileData> = new Map();
  private baseTileSize = TILE_SIZE;
  private transitionTileSize = TILE_SIZE;
  private variantCounts: Record<string, number> = {};

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  generateAtlas(): string {
    if (this.scene.textures.exists(this.atlasKey)) {
      return this.atlasKey;
    }

    const baseTypes = TERRAIN_TYPES.length;
    const transitionTypes = TRANSITION_TYPES.length;
    const totalTypes = baseTypes + transitionTypes;
    const cols = 16;
    const rows = Math.ceil(totalTypes / cols);
    const atlasWidth = cols * this.baseTileSize;
    const atlasHeight = rows * this.baseTileSize;

    const graphics = this.scene.add.graphics({ x: 0, y: 0 });

    TERRAIN_TYPES.forEach((type, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * this.baseTileSize;
      const y = row * this.baseTileSize;

      const def = terrainDefinitions[type];
      this.drawBaseTile(graphics, type, def.color, x, y);
      this.addVariation(graphics, type, x, y);
      this.tiles.set(type, { type, frameIndex: index, variants: this.variantCounts[type] || 1 });
    });

    TRANSITION_TYPES.forEach((type, index) => {
      const globalIndex = baseTypes + index;
      const col = globalIndex % cols;
      const row = Math.floor(globalIndex / cols);
      const x = col * this.baseTileSize;
      const y = row * this.baseTileSize;

      this.drawTransitionTile(graphics, type, x, y);
      this.tiles.set(type, { type, frameIndex: globalIndex, variants: 1 });
    });

    graphics.generateTexture(this.atlasKey, atlasWidth, atlasHeight);
    graphics.destroy();

    const texture = this.scene.textures.get(this.atlasKey);
    if (texture) {
      const source = texture.getSourceImage() as HTMLCanvasElement;
      if (source) {
        this.tiles.forEach((data) => {
          const col = data.frameIndex % cols;
          const row = Math.floor(data.frameIndex / cols);
          const x = col * this.baseTileSize;
          const y = row * this.baseTileSize;
          texture.add(data.frameIndex.toString(), 0, x, y, this.baseTileSize, this.baseTileSize);
        });
      }
    }

    return this.atlasKey;
  }

  private drawBaseTile(graphics: Phaser.GameObjects.Graphics, type: TerrainType, color: number, x: number, y: number): void {
    graphics.fillStyle(color, 1);
    graphics.fillRect(x, y, this.baseTileSize, this.baseTileSize);
  }

  private addVariation(graphics: Phaser.GameObjects.Graphics, type: TerrainType, baseX: number, baseY: number): void {
    let variationCount = 3;
    let colors: number[] = [];

    switch (type) {
      case 'grass':
        variationCount = 6;
        colors = [0x689f38, 0x7cb342, 0x8bc34a, 0x558b2f, 0x4caf50, 0x388e3c];
        break;
      case 'forest_floor':
        variationCount = 5;
        colors = [0x4e342e, 0x5d4037, 0x6d4c41, 0x3e2723, 0x4a3728];
        break;
      case 'dirt':
      case 'path':
        variationCount = 4;
        colors = [0x795548, 0x8d6e63, 0xa1887f, 0x6d4c41];
        break;
      case 'stone':
      case 'mountain':
      case 'ruins':
        variationCount = 4;
        colors = [0x616161, 0x757575, 0x90a4ae, 0x455a64];
        break;
      case 'sand':
        variationCount = 3;
        colors = [0xe8d5b7, 0xf5e6c8, 0xfff3e0];
        break;
      case 'shallow_water':
        variationCount = 4;
        colors = [0x4fc3f7, 0x29b6f6, 0x03a9f4, 0x0288d1];
        break;
      case 'farmland':
        variationCount = 4;
        colors = [0x795548, 0x8d6e63, 0x6d4c41, 0x5d4037];
        break;
      case 'snow':
        variationCount = 3;
        colors = [0xe0f7fa, 0xffffff, 0xcfd8dc];
        break;
      default:
        colors = [0x888888];
    }

    for (let i = 0; i < variationCount; i++) {
      const vx = baseX + Phaser.Math.Between(3, this.baseTileSize - 5);
      const vy = baseY + Phaser.Math.Between(3, this.baseTileSize - 5);
      const size = Phaser.Math.Between(2, 6);
      const color = Phaser.Math.RND.pick(colors);
      graphics.fillStyle(color, 0.4);
      graphics.fillCircle(vx, vy, size);
    }

    this.variantCounts[type] = variationCount + 1;
  }

  private drawTransitionTile(graphics: Phaser.GameObjects.Graphics, type: string, x: number, y: number): void {
    const [from, to] = type.split('_');
    const fromDef = terrainDefinitions[from as TerrainType] || terrainDefinitions.grass;
    const toDef = terrainDefinitions[to as TerrainType] || terrainDefinitions.dirt;

    graphics.fillStyle(fromDef.color, 1);
    graphics.fillRect(x, y, this.baseTileSize, this.baseTileSize);

    const blendColor = this.blendColors(fromDef.color, toDef.color, 0.5);
    graphics.fillStyle(blendColor, 0.6);

    if (type.includes('water') || type.includes('river')) {
      this.drawWaterTransition(graphics, x, y, from, to);
    } else if (type.includes('cliff') || type.includes('mountain')) {
      this.drawCliffTransition(graphics, x, y, from, to);
    } else if (type.includes('path') || type.includes('bridge')) {
      this.drawPathTransition(graphics, x, y, from, to);
    } else {
      this.drawOrganicTransition(graphics, x, y, from, to);
    }
  }

  private drawWaterTransition(graphics: Phaser.GameObjects.Graphics, x: number, y: number, from: string, to: string): void {
    const isVertical = ['shallow_deep', 'shallow_river', 'river_deep'].includes(`${from}_${to}`);

    for (let i = 0; i < 5; i++) {
      const offset = (i / 5) * this.baseTileSize;
      graphics.fillStyle(0x81d4fa, 0.3 - i * 0.05);
      if (isVertical) {
        graphics.fillRect(x, y + offset, this.baseTileSize, 4);
      } else {
        graphics.fillRect(x + offset, y, 4, this.baseTileSize);
      }
    }
  }

  private drawCliffTransition(graphics: Phaser.GameObjects.Graphics, x: number, y: number, from: string, to: string): void {
    const fromDef = terrainDefinitions[from as TerrainType] || terrainDefinitions.stone;
    const shadowColor = Phaser.Display.Color.IntegerToColor(fromDef.color);
    const darker = Phaser.Display.Color.GetColor(
      Math.max(0, (shadowColor as any).r - 40),
      Math.max(0, (shadowColor as any).g - 40),
      Math.max(0, (shadowColor as any).b - 40)
    );
    graphics.fillStyle(darker, 0.8);

    for (let i = 0; i < 3; i++) {
      const offset = 4 + i * 8;
      graphics.fillRect(x, y + offset, this.baseTileSize, 3);
    }
  }

  private drawPathTransition(graphics: Phaser.GameObjects.Graphics, x: number, y: number, from: string, to: string): void {
    const pathColor = terrainDefinitions.path.color;
    graphics.fillStyle(pathColor, 0.7);

    const centerX = x + this.baseTileSize / 2;
    const centerY = y + this.baseTileSize / 2;
    graphics.fillEllipse(centerX, centerY, this.baseTileSize * 0.6, this.baseTileSize * 0.6);
  }

  private drawOrganicTransition(graphics: Phaser.GameObjects.Graphics, x: number, y: number, from: string, to: string): void {
    const toDef = terrainDefinitions[to as TerrainType] || terrainDefinitions.dirt;
    const blendColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.IntegerToColor(terrainDefinitions[from as TerrainType]?.color || 0x5a9e32),
      Phaser.Display.Color.IntegerToColor(toDef.color),
      10, 5
    );
    graphics.fillStyle(Phaser.Display.Color.ObjectToColor(blendColor).color, 0.5);

    for (let i = 0; i < 8; i++) {
      const vx = x + Phaser.Math.Between(2, this.baseTileSize - 4);
      const vy = y + Phaser.Math.Between(2, this.baseTileSize - 4);
      const size = Phaser.Math.Between(3, 8);
      graphics.fillCircle(vx, vy, size);
    }
  }

  private blendColors(color1: number, color2: number, ratio: number): number {
    const c1 = Phaser.Display.Color.IntegerToColor(color1) as any;
    const c2 = Phaser.Display.Color.IntegerToColor(color2) as any;
    return Phaser.Display.Color.GetColor(
      Math.round(c1.r * (1 - ratio) + c2.r * ratio),
      Math.round(c1.g * (1 - ratio) + c2.g * ratio),
      Math.round(c1.b * (1 - ratio) + c2.b * ratio)
    );
  }

  getTileData(type: TerrainType | string): TerrainTileData | undefined {
    return this.tiles.get(type);
  }

  getFrameIndex(type: TerrainType | string): number {
    return this.tiles.get(type)?.frameIndex ?? 0;
  }

  getVariants(type: TerrainType | string): number {
    return this.tiles.get(type)?.variants ?? 1;
  }

  getAtlasKey(): string {
    return this.atlasKey;
  }

  getTileSize(): number {
    return this.baseTileSize;
  }

  destroy(): void {
    this.scene.textures.remove(this.atlasKey);
    this.tiles.clear();
  }
}