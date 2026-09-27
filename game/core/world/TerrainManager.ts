import Phaser from 'phaser';
import { terrainDefinitions, TerrainType, TILE_SIZE } from '@data/world/terrain';

export class TerrainManager {
  private scene: Phaser.Scene;
  private generatedAtlasKey = 'terrain_atlas_v2';

  private readonly terrainOrder: TerrainType[] = [
    'grass', 'dirt', 'forest_floor', 'stone', 'sand', 'mud',
    'shallow_water', 'deep_water', 'river', 'cliff', 'mountain',
    'farmland', 'ruins', 'cave_floor', 'path', 'bridge', 'snow',
  ];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  generateTerrainAtlas(): string {
    if (this.scene.textures.exists(this.generatedAtlasKey)) {
      return this.generatedAtlasKey;
    }

    const cols = 6;
    const rows = Math.ceil(this.terrainOrder.length / cols);
    const atlasWidth = cols * TILE_SIZE;
    const atlasHeight = rows * TILE_SIZE;

    const graphics = this.scene.add.graphics();

    this.terrainOrder.forEach((type, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      const def = terrainDefinitions[type] || terrainDefinitions.grass;
      graphics.fillStyle(def.color, 1);
      graphics.fillRect(x, y, TILE_SIZE, TILE_SIZE);

      // Add texture noise & organic variations
      for (let i = 0; i < 6; i++) {
        const vx = x + Phaser.Math.Between(2, TILE_SIZE - 4);
        const vy = y + Phaser.Math.Between(2, TILE_SIZE - 4);
        const size = Phaser.Math.Between(2, 5);
        graphics.fillStyle(0xffffff, 0.08);
        graphics.fillCircle(vx, vy, size);
      }
    });

    graphics.generateTexture(this.generatedAtlasKey, atlasWidth, atlasHeight);
    graphics.destroy();

    return this.generatedAtlasKey;
  }

  getTerrainTypeIndex(type: TerrainType): number {
    const idx = this.terrainOrder.indexOf(type);
    return idx >= 0 ? idx : 0;
  }
}
