import Phaser from 'phaser';
import type { CharacterCustomization } from '@shared/types';
import { skinTones, hairColors, hairstyles, tops, bottoms, shoes, accessories, defaultCustomization } from '@data/characters';

export class CharacterCreationScene extends Phaser.Scene {
  private currentCustomization: CharacterCustomization;
  private previewSprite!: Phaser.GameObjects.Container;
  private colorButtons: Map<string, Phaser.GameObjects.Container> = new Map();
  private optionButtons: Map<string, Phaser.GameObjects.Container[]> = new Map();
  private confirmButton!: Phaser.GameObjects.Container;
  private categoryLabels: Map<string, Phaser.GameObjects.Text> = new Map();

  constructor() {
    super({ key: 'CharacterCreationScene' });
    this.currentCustomization = { ...defaultCustomization };
  }

  create() {
    // Background
    this.cameras.main.setBackgroundColor('#f5f0e6');

    // Create UI
    this.createTitle();
    this.createCharacterPreview();
    this.createSkinToneSelector();
    this.createHairSelector();
    this.createClothingSelector();
    this.createAccessorySelector();
    this.createConfirmButton();
  }

  private createTitle() {
    const title = this.add.text(400, 40, 'Create Your Character', {
      fontSize: '32px',
      color: '#5d4037',
      fontFamily: 'Georgia, serif'
    }).setOrigin(0.5);

    const subtitle = this.add.text(400, 80, 'Customize your appearance', {
      fontSize: '16px',
      color: '#8d6e63',
      fontFamily: 'Georgia, serif'
    }).setOrigin(0.5);
  }

  private createCharacterPreview() {
    // Preview container
    const previewBg = this.add.rectangle(200, 350, 200, 300, 0xe8e0d0);
    previewBg.setStrokeStyle(2, 0x8d6e63);

    // Character preview sprite
    this.previewSprite = this.add.container(200, 350);
    this.updatePreview();

    // Animated rotation/sway
    this.tweens.add({
      targets: this.previewSprite,
      y: 340,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private updatePreview() {
    this.previewSprite.removeAll(true);

    const skinTonesMap: Record<string, number> = {
      'skin_01': 0xffe4d0, 'skin_02': 0xf5d0b5, 'skin_03': 0xe8c4a2,
      'skin_04': 0xd4a574, 'skin_05': 0xc4956a, 'skin_06': 0xa67c52,
      'skin_07': 0x8b5a2b, 'skin_08': 0x6b4423, 'skin_09': 0x4a3021,
      'skin_10': 0x3d261a
    };

    const skinColor = skinTonesMap[this.currentCustomization.skinTone] || 0xffd7ba;
    const topColor = Phaser.Display.Color.HexStringToColor(this.currentCustomization.topColor || '#87CEEB').color;
    const bottomColor = Phaser.Display.Color.HexStringToColor(this.currentCustomization.bottomColor || '#8B4513').color;
    const hairColor = Phaser.Display.Color.HexStringToColor(this.currentCustomization.hairColor || '#6B4226').color;
    const shoeColor = Phaser.Display.Color.HexStringToColor(this.currentCustomization.shoesColor || '#5C4033').color;

    // Scale for preview
    const scale = 2;

    // Legs
    const legs = this.add.rectangle(0, 40 * scale / 2, 20, 24, bottomColor);
    legs.setScale(scale);

    // Body
    const body = this.add.rectangle(0, 0, 24, 32, topColor);
    body.setScale(scale);

    // Head
    const head = this.add.circle(0, -25 * scale, 14, skinColor);

    // Hair
    const hair = this.add.rectangle(0, -30 * scale, 28, 14, hairColor);

    // Eyes
    const eyes = this.add.rectangle(0, -25 * scale, 10, 3, 0x000000);

    // Shoes
    const leftShoe = this.add.rectangle(-8, 55 * scale / 2, 8, 6, shoeColor);
    const rightShoe = this.add.rectangle(8, 55 * scale / 2, 8, 6, shoeColor);

    this.previewSprite.add([legs, body, head, hair, eyes, leftShoe, rightShoe]);

    // Add accessory if selected
    if (this.currentCustomization.accessory) {
      const acc = this.createAccessorySprite();
      if (acc) this.previewSprite.add(acc);
    }
  }

  private createAccessorySprite(): Phaser.GameObjects.GameObject | null {
    // Simple accessory rendering
    const accColor = Phaser.Display.Color.HexStringToColor(this.currentCustomization.accessoryColor || '#D4A76A').color;

    if (this.currentCustomization.accessory?.startsWith('acc_01')) {
      // Straw hat
      return this.add.rectangle(0, -45, 40, 8, accColor);
    } else if (this.currentCustomization.accessory?.startsWith('acc_02')) {
      // Flower crown
      return this.add.ellipse(0, -38, 36, 12, 0xff6b9d);
    } else if (this.currentCustomization.accessory?.startsWith('acc_05')) {
      // Glasses
      return this.add.rectangle(0, -25, 24, 8, 0x1c1c1c);
    }

    return null;
  }

  private createSkinToneSelector() {
    const startY = 130;
    const startX = 350;

    const label = this.add.text(startX, startY, 'Skin Tone', {
      fontSize: '14px',
      color: '#5d4037'
    });
    this.categoryLabels.set('skin', label);

    skinTones.forEach((skin, index) => {
      const x = startX + (index % 5) * 50;
      const y = startY + 25 + Math.floor(index / 5) * 40;

      const btn = this.createColorButton(x, y, skin.hex, 'skin', skin.id);
      this.colorButtons.set(`skin_${skin.id}`, btn);
    });
  }

  private createHairSelector() {
    const startY = 230;
    const startX = 350;

    const label = this.add.text(startX, startY, 'Hair Style', {
      fontSize: '14px',
      color: '#5d4037'
    });

    hairstyles.forEach((hair, index) => {
      const x = startX + (index % 4) * 90;
      const y = startY + 25 + Math.floor(index / 4) * 35;

      const btn = this.createOptionButton(x, y, hair.name, 'hair', hair.id);
      if (!this.optionButtons.has('hair')) this.optionButtons.set('hair', []);
      this.optionButtons.get('hair')?.push(btn);
    });

    // Hair color selector
    const colorLabel = this.add.text(startX, startY + 80, 'Hair Color', {
      fontSize: '14px',
      color: '#5d4037'
    });

    const hairColorsToShow = hairColors.slice(0, 10);
    hairColorsToShow.forEach((color, index) => {
      const x = startX + (index % 5) * 50;
      const y = startY + 105 + Math.floor(index / 5) * 35;

      const btn = this.createColorButton(x, y, color, 'hairColor', color);
      this.colorButtons.set(`hairColor_${color}`, btn);
    });
  }

  private createClothingSelector() {
    const startY = 380;
    const startX = 350;

    // Top
    const topLabel = this.add.text(startX, startY, 'Top', {
      fontSize: '14px',
      color: '#5d4037'
    });

    tops.slice(0, 4).forEach((top, index) => {
      const x = startX + index * 90;
      const y = startY + 25;

      const btn = this.createOptionButton(x, y, top.name, 'top', top.id);
      if (!this.optionButtons.has('top')) this.optionButtons.set('top', []);
      this.optionButtons.get('top')?.push(btn);
    });

    // Top color
    const topColorLabel = this.add.text(startX, startY + 50, 'Top Color', {
      fontSize: '14px',
      color: '#5d4037'
    });

    const topColorsToShow = ['#F5F5DC', '#87CEEB', '#556B2F', '#DB7093', '#4682B4', '#D4A76A'];
    topColorsToShow.forEach((color, index) => {
      const x = startX + (index % 6) * 50;
      const y = startY + 75;

      const btn = this.createColorButton(x, y, color, 'topColor', color);
      this.colorButtons.set(`topColor_${color}`, btn);
    });

    // Bottom
    const bottomLabel = this.add.text(startX, startY + 110, 'Bottom', {
      fontSize: '14px',
      color: '#5d4037'
    });

    bottoms.slice(0, 4).forEach((bottom, index) => {
      const x = startX + index * 90;
      const y = startY + 135;

      const btn = this.createOptionButton(x, y, bottom.name, 'bottom', bottom.id);
      if (!this.optionButtons.has('bottom')) this.optionButtons.set('bottom', []);
      this.optionButtons.get('bottom')?.push(btn);
    });

    // Bottom color
    const bottomColorsToShow = ['#8B4513', '#556B2F', '#D4A76A', '#2F4F4F', '#4682B4'];
    bottomColorsToShow.forEach((color, index) => {
      const x = startX + index * 50;
      const y = startY + 160;

      const btn = this.createColorButton(x, y, color, 'bottomColor', color);
      this.colorButtons.set(`bottomColor_${color}`, btn);
    });
  }

  private createAccessorySelector() {
    const startY = 580;
    const startX = 350;

    const label = this.add.text(startX, startY, 'Accessories', {
      fontSize: '14px',
      color: '#5d4037'
    });

    accessories.slice(0, 4).forEach((acc, index) => {
      const x = startX + index * 90;
      const y = startY + 25;

      const btn = this.createOptionButton(x, y, acc.name, 'accessory', acc.id);
      if (!this.optionButtons.has('accessory')) this.optionButtons.set('accessory', []);
      this.optionButtons.get('accessory')?.push(btn);
    });

    // None option
    const noneBtn = this.createOptionButton(startX + 4 * 90, startY + 25, 'None', 'accessory', 'none');
    this.optionButtons.get('accessory')?.push(noneBtn);
  }

  private createColorButton(x: number, y: number, color: string, category: string, value: string): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const colorValue = Phaser.Display.Color.HexStringToColor(color).color;

    const bg = this.add.rectangle(0, 0, 36, 28, 0xe8e0d0);
    bg.setStrokeStyle(2, 0x8d6e63);
    const colorSwatch = this.add.rectangle(0, 0, 28, 20, colorValue);

    container.add([bg, colorSwatch]);

    // Check if this is currently selected
    const currentKey = category === 'skin' ? this.currentCustomization.skinTone :
                        category === 'hairColor' ? this.currentCustomization.hairColor :
                        category === 'topColor' ? this.currentCustomization.topColor :
                        category === 'bottomColor' ? this.currentCustomization.bottomColor : '';

    if (currentKey === value) {
      bg.setStrokeStyle(3, 0x4caf50);
    }

    container.setSize(36, 28);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.setStrokeStyle(2, 0x4caf50);
    });

    container.on('pointerout', () => {
      const isSelected = currentKey === value;
      bg.setStrokeStyle(isSelected ? 3 : 2, isSelected ? 0x4caf50 : 0x8d6e63);
    });

    container.on('pointerdown', () => {
      this.updateCustomization(category, value);
    });

    return container;
  }

  private createOptionButton(x: number, y: number, name: string, category: string, value: string): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 80, 28, 0xe8e0d0);
    bg.setStrokeStyle(2, 0x8d6e63);
    const text = this.add.text(0, 0, name.length > 12 ? name.substring(0, 10) + '...' : name, {
      fontSize: '11px',
      color: '#5d4037'
    }).setOrigin(0.5);

    container.add([bg, text]);

    // Check if this is currently selected
    const currentValue = category === 'hair' ? this.currentCustomization.hair :
                          category === 'top' ? this.currentCustomization.top :
                          category === 'bottom' ? this.currentCustomization.bottom :
                          category === 'accessory' ? (this.currentCustomization.accessory || 'none') : '';

    if (currentValue === value || (value === 'none' && !this.currentCustomization.accessory)) {
      bg.setStrokeStyle(3, 0x4caf50);
      bg.setFillStyle(0xc8e6c9);
    }

    container.setSize(80, 28);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.setStrokeStyle(2, 0x4caf50);
    });

    container.on('pointerout', () => {
      const isSelected = currentValue === value || (value === 'none' && !this.currentCustomization.accessory);
      bg.setStrokeStyle(isSelected ? 3 : 2, isSelected ? 0x4caf50 : 0x8d6e63);
      bg.setFillStyle(isSelected ? 0xc8e6c9 : 0xe8e0d0);
    });

    container.on('pointerdown', () => {
      this.updateCustomization(category, value);
    });

    return container;
  }

  private updateCustomization(category: string, value: string) {
    switch (category) {
      case 'skin':
        this.currentCustomization.skinTone = value;
        break;
      case 'hair':
        this.currentCustomization.hair = value;
        break;
      case 'hairColor':
        this.currentCustomization.hairColor = value;
        break;
      case 'top':
        this.currentCustomization.top = value;
        break;
      case 'topColor':
        this.currentCustomization.topColor = value;
        break;
      case 'bottom':
        this.currentCustomization.bottom = value;
        break;
      case 'bottomColor':
        this.currentCustomization.bottomColor = value;
        break;
      case 'accessory':
        this.currentCustomization.accessory = value === 'none' ? null : value;
        break;
    }

    this.updatePreview();
    this.updateButtonStates();
  }

  private updateButtonStates() {
    // Refresh all button states
    this.colorButtons.forEach((container, key) => {
      const [category, value] = key.split('_');
      const bg = container.getAt(0) as Phaser.GameObjects.Rectangle;
      const currentKey = category === 'skin' ? this.currentCustomization.skinTone :
                         category === 'hairColor' ? this.currentCustomization.hairColor :
                         category === 'topColor' ? this.currentCustomization.topColor :
                         category === 'bottomColor' ? this.currentCustomization.bottomColor : '';

      bg.setStrokeStyle(currentKey === value ? 3 : 2, currentKey === value ? 0x4caf50 : 0x8d6e63);
    });

    this.optionButtons.forEach((buttons, category) => {
      buttons.forEach((container) => {
        const bg = container.getAt(0) as Phaser.GameObjects.Rectangle;
        const text = container.getAt(1) as Phaser.GameObjects.Text;
        const value = this.getButtonValue(container);
        const currentValue = category === 'hair' ? this.currentCustomization.hair :
                            category === 'top' ? this.currentCustomization.top :
                            category === 'bottom' ? this.currentCustomization.bottom :
                            category === 'accessory' ? (this.currentCustomization.accessory || 'none') : '';

        const isSelected = currentValue === value || (value === 'none' && !this.currentCustomization.accessory);
        bg.setStrokeStyle(isSelected ? 3 : 2, isSelected ? 0x4caf50 : 0x8d6e63);
        bg.setFillStyle(isSelected ? 0xc8e6c9 : 0xe8e0d0);
      });
    });
  }

  private getButtonValue(container: Phaser.GameObjects.Container): string {
    // This is a simplified version - in production, store the value in container data
    const text = container.getAt(1) as Phaser.GameObjects.Text;
    const name = text.text;

    // Find matching item
    const match = [...hairstyles, ...tops, ...bottoms, ...accessories].find(item =>
      item.name === name || item.name.startsWith(name) || name.startsWith(item.name.substring(0, 10))
    );

    return match?.id || 'none';
  }

  private createConfirmButton() {
    this.confirmButton = this.add.container(400, 560);

    const bg = this.add.rectangle(0, 0, 180, 50, 0x558b2f);
    bg.setStrokeStyle(3, 0x33691e);
    const text = this.add.text(0, 0, 'Enter Village', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Georgia, serif'
    }).setOrigin(0.5);

    this.confirmButton.add([bg, text]);
    this.confirmButton.setSize(180, 50);
    this.confirmButton.setInteractive({ useHandCursor: true });

    this.confirmButton.on('pointerover', () => {
      bg.setFillStyle(0x689f38);
    });

    this.confirmButton.on('pointerout', () => {
      bg.setFillStyle(0x558b2f);
    });

    this.confirmButton.on('pointerdown', () => {
      this.confirmCharacter();
    });
  }

  private confirmCharacter() {
    // Store customization and transition to village
    this.scene.start('VillageScene', {
      customization: this.currentCustomization
    });
  }
}
