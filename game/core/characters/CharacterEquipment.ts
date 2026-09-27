import type { CharacterCustomization } from '@shared/types';

export interface EquipmentLayer {
  layerName: 'skin' | 'shoes' | 'bottom' | 'top' | 'hair' | 'accessory';
  color: number;
  style: string;
}

export class CharacterEquipment {
  private customization: CharacterCustomization;

  constructor(customization: CharacterCustomization) {
    this.customization = customization;
  }

  getEquipmentLayers(): EquipmentLayer[] {
    const parseColor = (colorStr?: string, defaultColor: number = 0x333333): number => {
      if (!colorStr) return defaultColor;
      if (colorStr.startsWith('#')) return parseInt(colorStr.replace('#', '0x'), 16);
      if (colorStr.startsWith('0x')) return parseInt(colorStr, 16);
      return defaultColor;
    };

    return [
      {
        layerName: 'skin',
        color: parseColor(this.customization.skinTone, 0xe0ac69),
        style: 'default',
      },
      {
        layerName: 'shoes',
        color: parseColor(this.customization.shoesColor, 0x4e342e),
        style: this.customization.shoes || 'boots',
      },
      {
        layerName: 'bottom',
        color: parseColor(this.customization.bottomColor, 0x1565c0),
        style: this.customization.bottom || 'pants',
      },
      {
        layerName: 'top',
        color: parseColor(this.customization.topColor, 0xc62828),
        style: this.customization.top || 'tunic',
      },
      {
        layerName: 'hair',
        color: parseColor(this.customization.hairColor, 0x3e2723),
        style: this.customization.hair || 'short',
      },
      {
        layerName: 'accessory',
        color: parseColor(this.customization.accessoryColor, 0xffd700),
        style: this.customization.accessory || 'none',
      },
    ];
  }

  updateCustomization(newCustomization: Partial<CharacterCustomization>): void {
    this.customization = { ...this.customization, ...newCustomization };
  }
}
