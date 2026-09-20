import type { SkinTone, CharacterAppearance } from '@/types';

export const skinTones: SkinTone[] = [
  { id: 'skin_01', name: 'Porcelain', hex: '#FFE4D0' },
  { id: 'skin_02', name: 'Fair', hex: '#F5D0B5' },
  { id: 'skin_03', name: 'Light', hex: '#E8C4A2' },
  { id: 'skin_04', name: 'Medium', hex: '#D4A574' },
  { id: 'skin_05', name: 'Tan', hex: '#C4956A' },
  { id: 'skin_06', name: 'Warm Brown', hex: '#A67C52' },
  { id: 'skin_07', name: 'Brown', hex: '#8B5A2B' },
  { id: 'skin_08', name: 'Dark Brown', hex: '#6B4423' },
  { id: 'skin_09', name: 'Deep', hex: '#4A3021' },
  { id: 'skin_10', name: 'Ebony', hex: '#3D261A' }
];

export const hairColors: string[] = [
  '#2C1810', // Black
  '#4A3728', // Dark Brown
  '#6B4226', // Brown
  '#8B6914', // Auburn
  '#C17F59', // Light Brown
  '#D4A76A', // Dirty Blonde
  '#F5DEB3', // Blonde
  '#E8D4A2', // Platinum
  '#FF6B35', // Orange
  '#C41E3A', // Red
  '#4169E1', // Blue
  '#9370DB', // Purple
  '#50C878', // Green
  '#FFB6C1', // Pink
  '#E8E8E8', // White
  '#808080'  // Gray
];

export const clothingColors: string[] = [
  '#F5F5DC', // Cream
  '#E8D4A2', // Beige
  '#D4A76A', // Tan
  '#8B4513', // Brown
  '#556B2F', // Olive
  '#228B22', // Forest Green
  '#6B8E23', // Green
  '#87CEEB', // Sky Blue
  '#4682B4', // Steel Blue
  '#6A5ACD', // Slate Blue
  '#9370DB', // Purple
  '#DB7093', // Pink
  '#CD5C5C', // Rust
  '#DC143C', // Crimson
  '#F4A460', // Sand
  '#DEB887', // Wheat
  '#2F4F4F', // Dark Slate
  '#1C1C1C', // Black
  '#4A4A4A', // Charcoal
  '#8B8B83'  // Gray
];

export const hairstyles: CharacterAppearance[] = [
  { id: 'hair_01', name: 'Short & Neat', category: 'hair', defaultColor: '#6B4226' },
  { id: 'hair_02', name: 'Messy Short', category: 'hair', defaultColor: '#6B4226' },
  { id: 'hair_03', name: 'Medium Wavy', category: 'hair', defaultColor: '#8B6914' },
  { id: 'hair_04', name: 'Long Straight', category: 'hair', defaultColor: '#4A3728' },
  { id: 'hair_05', name: 'Long Wavy', category: 'hair', defaultColor: '#C17F59' },
  { id: 'hair_06', name: 'Braided', category: 'hair', defaultColor: '#8B6914' },
  { id: 'hair_07', name: 'Ponytail', category: 'hair', defaultColor: '#6B4226' },
  { id: 'hair_08', name: 'Bun', category: 'hair', defaultColor: '#2C1810' }
];

export const tops: CharacterAppearance[] = [
  { id: 'top_01', name: 'Simple T-Shirt', category: 'top', defaultColor: '#87CEEB' },
  { id: 'top_02', name: 'Cozy Sweater', category: 'top', defaultColor: '#D4A76A' },
  { id: 'top_03', name: 'Button-Up Shirt', category: 'top', defaultColor: '#F5F5DC' },
  { id: 'top_04', name: 'Village Tunic', category: 'top', defaultColor: '#556B2F' },
  { id: 'top_05', name: 'Floral Blouse', category: 'top', defaultColor: '#DB7093' },
  { id: 'top_06', name: 'Knit Cardigan', category: 'top', defaultColor: '#8B4513' },
  { id: 'top_07', name: 'Work Apron', category: 'top', defaultColor: '#DEB887' },
  { id: 'top_08', name: 'Embroidered Vest', category: 'top', defaultColor: '#228B22' }
];

export const bottoms: CharacterAppearance[] = [
  { id: 'bottom_01', name: 'Simple Trousers', category: 'bottom', defaultColor: '#8B4513' },
  { id: 'bottom_02', name: 'Long Skirt', category: 'bottom', defaultColor: '#556B2F' },
  { id: 'bottom_03', name: 'Shorts', category: 'bottom', defaultColor: '#D4A76A' },
  { id: 'bottom_04', name: 'Cottagecore Dress', category: 'bottom', defaultColor: '#F5DEB3' },
  { id: 'bottom_05', name: 'Overalls', category: 'bottom', defaultColor: '#4682B4' },
  { id: 'bottom_06', name: 'Patched Pants', category: 'bottom', defaultColor: '#2F4F4F' }
];

export const shoes: CharacterAppearance[] = [
  { id: 'shoes_01', name: 'Simple Boots', category: 'shoes', defaultColor: '#5C4033' },
  { id: 'shoes_02', name: 'Leather Shoes', category: 'shoes', defaultColor: '#8B4513' },
  { id: 'shoes_03', name: 'Garden Clogs', category: 'shoes', defaultColor: '#6B8E23' },
  { id: 'shoes_04', name: 'Canvas Sneakers', category: 'shoes', defaultColor: '#E8E8E8' }
];

export const accessories: CharacterAppearance[] = [
  { id: 'acc_01', name: 'Straw Hat', category: 'accessory', defaultColor: '#D4A76A' },
  { id: 'acc_02', name: 'Flower Crown', category: 'accessory', defaultColor: '#FFB6C1' },
  { id: 'acc_03', name: 'Bandana', category: 'accessory', defaultColor: '#CD5C5C' },
  { id: 'acc_04', name: 'Ribbon Bow', category: 'accessory', defaultColor: '#9370DB' },
  { id: 'acc_05', name: 'Glasses', category: 'accessory', defaultColor: '#1C1C1C' },
  { id: 'acc_06', name: 'Scarf', category: 'accessory', defaultColor: '#DC143C' },
  { id: 'acc_07', name: 'Belt', category: 'accessory', defaultColor: '#5C4033' },
  { id: 'acc_08', name: 'Necklace', category: 'accessory', defaultColor: '#D4A76A' }
];

export const defaultCustomization = {
  skinTone: 'skin_03',
  hair: 'hair_01',
  hairColor: '#6B4226',
  top: 'top_01',
  topColor: '#87CEEB',
  bottom: 'bottom_01',
  bottomColor: '#8B4513',
  shoes: 'shoes_01',
  shoesColor: '#5C4033',
  accessory: null
};
