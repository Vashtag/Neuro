import { GAME_CONFIG, PALETTE } from '../config.js';
import { Settings } from '../systems/Settings.js';

const FONT = 'Trebuchet MS, sans-serif';
const CREAM = '#f4ecdf';
const GOLD = '#f6d785';
const DIM = '#9a8fb8';

// SettingsPanel: a reusable, self-contained Settings overlay drawn into any
// scene (title menu or in-game UI). Music + SFX volume sliders, live-applied to
// the given SoundManager and persisted on close. Host scenes forward navigation
// via handle({up,down,left,right,confirm,back}).
const ROWS = [
  { id: 'musicVolume', label: 'Music' },
  { id: 'sfxVolume', label: 'SFX' },
  { id: 'back', label: 'Back' }
];
const SEGMENTS = 10;

export default class SettingsPanel {
  constructor(scene, sound, depth = 1800) {
    this.scene = scene;
    this.sound = sound;
    this.depth = depth;
    this.active = false;
    this.sel = 0;
    this.settings = Settings.load();
    this.segBars = {};
    this.segPcts = {};
  }

  isActive() {
    return this.active;
  }

  setSound(sound) {
    this.sound = sound;
  }

  open(onClose) {
    if (this.active) return;
    this.active = true;
    this.onClose = onClose;
    this.sel = 0;
    this.settings = Settings.load();
    Settings.apply(this.settings, this.sound);
    this.build();
    this.render();
  }

  build() {
    const { canvasWidth: w, canvasHeight: h } = GAME_CONFIG;
    const c = this.scene.add.container(0, 0).setDepth(this.depth).setAlpha(0);

    const dim = this.scene.add.graphics();
    dim.fillStyle(0x0c0a16, 0.78);
    dim.fillRect(0, 0, w, h);
    c.add(dim);

    const pw = 540;
    const ph = 320;
    const px = (w - pw) / 2;
    const py = (h - ph) / 2;
    const panel = this.scene.add.graphics();
    panel.fillStyle(PALETTE.uiPanel, 0.98);
    panel.fillRoundedRect(px, py, pw, ph, 16);
    panel.lineStyle(3, PALETTE.uiPanelEdge, 1);
    panel.strokeRoundedRect(px, py, pw, ph, 16);
    c.add(panel);

    c.add(
      this.scene.add
        .text(w / 2, py + 36, 'Settings', { fontFamily: FONT, fontSize: '28px', color: GOLD, fontStyle: 'bold' })
        .setOrigin(0.5)
    );

    this.rowTexts = [];
    const rowY = py + 96;
    const rowGap = 56;
    const labelX = px + 48;
    const barX = px + 200;
    const barW = 240;

    ROWS.forEach((row, i) => {
      const y = rowY + i * rowGap;
      const label = this.scene.add
        .text(labelX, y, row.label, { fontFamily: FONT, fontSize: '20px', color: CREAM })
        .setOrigin(0, 0.5);
      c.add(label);
      this.rowTexts.push(label);

      if (row.id !== 'back') {
        // Segmented volume bar.
        const segs = [];
        const segW = (barW - (SEGMENTS - 1) * 4) / SEGMENTS;
        for (let s = 0; s < SEGMENTS; s += 1) {
          const seg = this.scene.add.graphics();
          const sx = barX + s * (segW + 4);
          seg._x = sx;
          seg._y = y - 9;
          seg._w = segW;
          seg.fillStyle(0x2a2140, 1);
          seg.fillRoundedRect(sx, y - 9, segW, 18, 3);
          c.add(seg);
          segs.push(seg);
        }
        this.segBars[row.id] = segs;
        const pct = this.scene.add
          .text(barX + barW + 16, y, '', { fontFamily: FONT, fontSize: '15px', color: DIM })
          .setOrigin(0, 0.5);
        c.add(pct);
        this.segPcts[row.id] = pct;
      }
    });

    this.hint = this.scene.add
      .text(w / 2, py + ph - 26, '↑↓ choose   ·   ←→ adjust   ·   Esc / E back', {
        fontFamily: FONT,
        fontSize: '14px',
        color: DIM
      })
      .setOrigin(0.5);
    c.add(this.hint);

    this.container = c;
    this.scene.tweens.add({ targets: c, alpha: 1, duration: 200 });
  }

  render() {
    this.rowTexts.forEach((t, i) => {
      const on = i === this.sel;
      t.setColor(on ? GOLD : CREAM);
      t.setText(on ? `‹ ${ROWS[i].label}` : ROWS[i].label);
    });
    ['musicVolume', 'sfxVolume'].forEach((id) => {
      const v = this.settings[id];
      const filled = Math.round(v * SEGMENTS);
      this.segBars[id].forEach((seg, s) => {
        seg.clear();
        seg.fillStyle(s < filled ? PALETTE.glow : 0x2a2140, 1);
        seg.fillRoundedRect(seg._x, seg._y, seg._w, 18, 3);
      });
      this.segPcts[id].setText(`${Math.round(v * 100)}%`);
    });
  }

  apply() {
    this.sound.setMusicVolume(this.settings.musicVolume);
    this.sound.setSfxVolume(this.settings.sfxVolume);
  }

  // nav: booleans { up, down, left, right, confirm, back }
  handle(nav) {
    if (!this.active) return;
    if (nav.back) {
      this.close();
      return;
    }
    if (nav.up) {
      this.sel = (this.sel - 1 + ROWS.length) % ROWS.length;
      this.sound.play('dialogue');
      this.render();
    } else if (nav.down) {
      this.sel = (this.sel + 1) % ROWS.length;
      this.sound.play('dialogue');
      this.render();
    }

    const row = ROWS[this.sel];
    if (row.id !== 'back' && (nav.left || nav.right)) {
      const step = nav.right ? 0.1 : -0.1;
      this.settings[row.id] = Math.max(0, Math.min(1, Math.round((this.settings[row.id] + step) * 10) / 10));
      this.apply();
      this.render();
      this.sound.play(row.id === 'musicVolume' ? 'confirm' : 'water');
    }

    if (nav.confirm && row.id === 'back') {
      this.close();
    }
  }

  close() {
    if (!this.active) return;
    this.active = false;
    Settings.save(this.settings);
    if (this.container) {
      const c = this.container;
      this.scene.tweens.add({ targets: c, alpha: 0, duration: 160, onComplete: () => c.destroy() });
      this.container = null;
    }
    if (this.onClose) this.onClose();
  }
}
