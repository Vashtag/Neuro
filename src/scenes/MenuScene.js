import Phaser from 'phaser';
import { SCENES, GAME_CONFIG, PALETTE } from '../config.js';
import { GEN_KEYS } from '../systems/TextureFactory.js';
import { TEXTURE_KEYS } from '../data/assetManifest.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import SoundManager from '../systems/SoundManager.js';
import { Settings } from '../systems/Settings.js';
import SettingsPanel from '../objects/SettingsPanel.js';

const FONT = 'Trebuchet MS, sans-serif';
const CREAM = '#f4ecdf';
const GOLD = '#f6d785';
const DIM = '#9a8fb8';

// MenuScene: the title screen. Continue (if a save exists), New Game (with a
// confirm when it would erase progress), and How to Play. Keyboard + pointer.
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.MENU);
  }

  create() {
    const { canvasWidth: w, canvasHeight: h } = GAME_CONFIG;
    this.sound2 = new SoundManager();
    Settings.apply(Settings.load(), this.sound2);
    this.input.keyboard.once('keydown', () => this.sound2.ensureContext());
    this.input.once('pointerdown', () => this.sound2.ensureContext());
    this.settingsPanel = new SettingsPanel(this, this.sound2);

    this.mode = 'menu'; // 'menu' | 'help' | 'confirm'
    this.selected = 0;

    // Backdrop
    const bg = this.add.graphics();
    bg.fillStyle(0x140f22, 1);
    bg.fillRect(0, 0, w, h);
    // soft vignette band
    bg.fillStyle(0x241a3c, 0.6);
    bg.fillRect(0, h * 0.5, w, h * 0.5);

    // Drifting spores for cozy ambience.
    this.spores = [];
    for (let i = 0; i < 18; i += 1) {
      const s = this.add
        .image(Phaser.Math.Between(20, w - 20), Phaser.Math.Between(20, h - 20), TEXTURE_KEYS.sparkle)
        .setAlpha(Phaser.Math.FloatBetween(0.2, 0.6))
        .setScale(Phaser.Math.FloatBetween(0.4, 1));
      this.tweens.add({
        targets: s,
        y: s.y - Phaser.Math.Between(20, 60),
        alpha: 0.1,
        duration: Phaser.Math.Between(2600, 5200),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.spores.push(s);
    }

    // Title
    this.add
      .text(w / 2, h * 0.26, 'Neurobloom', {
        fontFamily: FONT,
        fontSize: '56px',
        color: GOLD,
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setShadow(0, 3, '#000000', 6, false, true);
    this.add
      .text(w / 2, h * 0.26 + 44, 'A cozy garden of memory', {
        fontFamily: FONT,
        fontSize: '18px',
        color: DIM,
        fontStyle: 'italic'
      })
      .setOrigin(0.5);

    // Three memory crops under the title.
    const icons = [GEN_KEYS.iconBerry, GEN_KEYS.iconDreamBloom, GEN_KEYS.iconKnowledgeHerb];
    icons.forEach((key, i) => {
      this.add
        .image(w / 2 - 40 + i * 40, h * 0.26 + 84, key)
        .setScale(1.3)
        .setAlpha(0.95);
    });

    // Menu items (built from save state).
    this.buildItems();

    // Help panel + confirm prompt (hidden until used).
    this.helpText = this.add
      .text(
        w / 2,
        h * 0.62,
        'Move: W A S D / arrows\nInteract: E or Space\nField Guide: J\nReset save: R    ·    Mute: M\n\nGrow memories, clear the fog, and tend three regions\nof the mind. Your garden saves itself as you go.',
        { fontFamily: FONT, fontSize: '16px', color: CREAM, align: 'center', lineSpacing: 6 }
      )
      .setOrigin(0.5)
      .setVisible(false);
    this.helpHint = this.add
      .text(w / 2, h - 40, 'E or Esc to go back', { fontFamily: FONT, fontSize: '14px', color: DIM })
      .setOrigin(0.5)
      .setVisible(false);

    this.confirmText = this.add
      .text(w / 2, h * 0.6, 'Start a new garden?\nThis erases your saved progress.', {
        fontFamily: FONT,
        fontSize: '18px',
        color: CREAM,
        align: 'center',
        lineSpacing: 6
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.footer = this.add
      .text(w / 2, h - 30, '↑ ↓ to choose   ·   E to confirm', {
        fontFamily: FONT,
        fontSize: '14px',
        color: DIM
      })
      .setOrigin(0.5);

    // Input
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      up2: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      down2: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      left2: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      right2: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      confirm: Phaser.Input.Keyboard.KeyCodes.E,
      confirm2: Phaser.Input.Keyboard.KeyCodes.SPACE,
      confirm3: Phaser.Input.Keyboard.KeyCodes.ENTER,
      back: Phaser.Input.Keyboard.KeyCodes.ESC
    });

    this.renderSelection();
  }

  buildItems() {
    const { canvasWidth: w, canvasHeight: h } = GAME_CONFIG;
    if (this.itemTexts) this.itemTexts.forEach((t) => t.destroy());
    this.items = [];
    if (SaveSystem.hasSave()) this.items.push({ id: 'continue', label: 'Continue' });
    this.items.push({ id: 'new', label: 'New Game' });
    this.items.push({ id: 'settings', label: 'Settings' });
    this.items.push({ id: 'help', label: 'How to Play' });

    const startY = h * 0.56;
    this.itemTexts = this.items.map((it, i) => {
      const t = this.add
        .text(w / 2, startY + i * 44, it.label, { fontFamily: FONT, fontSize: '24px', color: CREAM })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      t.on('pointerover', () => {
        if (this.mode !== 'menu') return;
        this.selected = i;
        this.renderSelection();
      });
      t.on('pointerdown', () => {
        if (this.mode !== 'menu') return;
        this.selected = i;
        this.activate();
      });
      return t;
    });
    this.selected = Math.min(this.selected, this.items.length - 1);
  }

  renderSelection() {
    this.itemTexts.forEach((t, i) => {
      const on = i === this.selected;
      t.setColor(on ? GOLD : CREAM);
      t.setScale(on ? 1.12 : 1);
      t.setText(on ? `‹ ${this.items[i].label} ›` : this.items[i].label);
    });
  }

  activate() {
    const item = this.items[this.selected];
    this.sound2.play('confirm');
    if (item.id === 'continue') {
      this.startGame();
    } else if (item.id === 'settings') {
      this.settingsPanel.open(() => this.renderSelection());
    } else if (item.id === 'help') {
      this.setMode('help');
    } else if (item.id === 'new') {
      if (SaveSystem.hasSave()) this.setMode('confirm');
      else this.startGame(true);
    }
  }

  setMode(mode) {
    this.mode = mode;
    const isMenu = mode === 'menu';
    this.itemTexts.forEach((t) => t.setVisible(isMenu));
    this.footer.setVisible(isMenu);
    this.helpText.setVisible(mode === 'help');
    this.helpHint.setVisible(mode === 'help');
    this.confirmText.setVisible(mode === 'confirm');
    if (mode === 'confirm') this.confirmText.setText('Start a new garden?\nThis erases your saved progress.\n\nE = yes      Esc = no');
  }

  startGame(fresh = false) {
    if (fresh) SaveSystem.reset();
    this.cameras.main.fadeOut(280, 12, 9, 24);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.GAME);
      this.scene.launch(SCENES.UI);
    });
  }

  update() {
    const k = this.keys;
    const pressed = (key) => Phaser.Input.Keyboard.JustDown(key);

    if (this.settingsPanel.isActive()) {
      this.settingsPanel.handle({
        up: pressed(k.up) || pressed(k.up2),
        down: pressed(k.down) || pressed(k.down2),
        left: pressed(k.left) || pressed(k.left2),
        right: pressed(k.right) || pressed(k.right2),
        confirm: pressed(k.confirm) || pressed(k.confirm2) || pressed(k.confirm3),
        back: pressed(k.back)
      });
      return;
    }

    if (this.mode === 'help') {
      if (pressed(k.confirm) || pressed(k.confirm2) || pressed(k.back)) {
        this.sound2.play('dialogue');
        this.setMode('menu');
        this.renderSelection();
      }
      return;
    }

    if (this.mode === 'confirm') {
      if (pressed(k.confirm) || pressed(k.confirm2) || pressed(k.confirm3)) {
        this.startGame(true);
      } else if (pressed(k.back)) {
        this.sound2.play('dialogue');
        this.setMode('menu');
        this.renderSelection();
      }
      return;
    }

    // menu mode
    if (pressed(k.up) || pressed(k.up2)) {
      this.selected = (this.selected - 1 + this.items.length) % this.items.length;
      this.sound2.play('dialogue');
      this.renderSelection();
    } else if (pressed(k.down) || pressed(k.down2)) {
      this.selected = (this.selected + 1) % this.items.length;
      this.sound2.play('dialogue');
      this.renderSelection();
    } else if (pressed(k.confirm) || pressed(k.confirm2) || pressed(k.confirm3)) {
      this.activate();
    }
  }
}
