import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from './config.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

const phaserConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: GAME_CONFIG.canvasWidth,
  height: GAME_CONFIG.canvasHeight,
  backgroundColor: '#1a1426',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, UIScene]
};

// eslint-disable-next-line no-new
new Phaser.Game(phaserConfig);

// Expose scene keys for quick debugging in the console during development.
window.NEUROBLOOM = { SCENES };
