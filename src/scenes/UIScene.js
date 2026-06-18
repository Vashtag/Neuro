import Phaser from 'phaser';
import { SCENES, GAME_CONFIG, PALETTE } from '../config.js';

// UIScene: transparent overlay above GameScene. Hosts the inventory bar, Field
// Notes panel, dialogue box, prompts and transient messages. Built up across
// milestones; M4 adds the transient message "toast".
export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.UI, active: false });
  }

  create() {
    this.scene.bringToTop();
    this.buildToast();
  }

  // --- transient message toast (bottom-center) ---
  buildToast() {
    const { canvasWidth: w, canvasHeight: h } = GAME_CONFIG;
    this.toast = this.add.container(w / 2, h - 96).setDepth(1000).setAlpha(0);

    const bg = this.add.graphics();
    this.toastBg = bg;

    const text = this.add
      .text(0, 0, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '17px',
        color: '#f4ecdf',
        align: 'center',
        wordWrap: { width: 520 }
      })
      .setOrigin(0.5);
    this.toastText = text;
    this.toast.add([bg, text]);
    this.toastTween = null;
  }

  showMessage(message, duration = 2200) {
    if (!this.toast) return;
    this.toastText.setText(message);

    // Resize the rounded background to fit the text.
    const pad = 16;
    const tw = Math.max(this.toastText.width + pad * 2, 120);
    const th = this.toastText.height + pad * 1.4;
    this.toastBg.clear();
    this.toastBg.fillStyle(PALETTE.uiPanel, 0.92);
    this.toastBg.fillRoundedRect(-tw / 2, -th / 2, tw, th, 10);
    this.toastBg.lineStyle(2, PALETTE.uiPanelEdge, 1);
    this.toastBg.strokeRoundedRect(-tw / 2, -th / 2, tw, th, 10);

    if (this.toastTween) this.toastTween.stop();
    this.toast.setAlpha(0);
    this.toastTween = this.tweens.add({
      targets: this.toast,
      alpha: 1,
      duration: 160,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.time.delayedCall(duration, () => {
          this.toastTween = this.tweens.add({
            targets: this.toast,
            alpha: 0,
            duration: 280,
            ease: 'Sine.easeIn'
          });
        });
      }
    });
  }
}
