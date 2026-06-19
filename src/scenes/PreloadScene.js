import Phaser from 'phaser';
import { SCENES, GAME_CONFIG, PALETTE } from '../config.js';
import { ASSET_FILES } from '../data/assetManifest.js';
import { generatePlaceholderTextures } from '../systems/TextureFactory.js';

// PreloadScene: shows a tiny loading bar, attempts to load any real art that
// exists, then generates programmatic placeholder textures for everything that
// did not load. Finally launches GameScene (world) + UIScene (overlay) together.
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENES.PRELOAD);
  }

  preload() {
    this.drawLoadingBar();

    // Attempt optional real-art overrides. Missing files must NOT crash the game,
    // so we swallow load errors and rely on placeholders generated in create().
    this.load.on('loaderror', (file) => {
      console.info(`[Neurobloom] optional asset not found, using placeholder: ${file.key}`);
    });

    ASSET_FILES.images.forEach(({ key, url }) => this.load.image(key, url));
    ASSET_FILES.audio.forEach(({ key, url }) => this.load.audio(key, url));
  }

  drawLoadingBar() {
    const { canvasWidth: w, canvasHeight: h } = GAME_CONFIG;
    const barW = 320;
    const barH = 18;
    const x = (w - barW) / 2;
    const y = h / 2;

    this.add
      .text(w / 2, y - 40, 'Neurobloom', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '28px',
        color: '#f6d785'
      })
      .setOrigin(0.5);

    const border = this.add.graphics();
    border.lineStyle(2, PALETTE.uiPanelEdge, 1);
    border.strokeRect(x, y, barW, barH);

    const bar = this.add.graphics();
    this.load.on('progress', (value) => {
      bar.clear();
      bar.fillStyle(PALETTE.archiveGlow, 1);
      bar.fillRect(x + 2, y + 2, (barW - 4) * value, barH - 4);
    });
  }

  create() {
    // Generate every placeholder texture that did not arrive as a real asset.
    // Keys that DID load (real PNGs) already exist and are skipped inside.
    generatePlaceholderTextures(this);

    // The title screen decides whether to continue or start a new garden.
    this.scene.start(SCENES.MENU);
  }
}
