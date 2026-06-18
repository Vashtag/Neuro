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
    this.buildDialogue();
  }

  // --- dialogue box (bottom, multi-line, advanced with E/Space) ---
  buildDialogue() {
    const { canvasWidth: w, canvasHeight: h } = GAME_CONFIG;
    const boxW = w - 80;
    const boxH = 120;
    const x = 40;
    const y = h - boxH - 24;

    this.dialogue = {
      active: false,
      lines: [],
      index: 0,
      onComplete: null
    };

    this.dialogueBox = this.add.container(0, 0).setDepth(1200).setVisible(false);

    const bg = this.add.graphics();
    bg.fillStyle(PALETTE.uiPanel, 0.96);
    bg.fillRoundedRect(x, y, boxW, boxH, 12);
    bg.lineStyle(3, PALETTE.uiPanelEdge, 1);
    bg.strokeRoundedRect(x, y, boxW, boxH, 12);

    const speaker = this.add.text(x + 20, y + 12, '', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '16px',
      color: '#f6d785',
      fontStyle: 'bold'
    });

    const body = this.add.text(x + 20, y + 40, '', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '18px',
      color: '#f4ecdf',
      wordWrap: { width: boxW - 40 },
      lineSpacing: 4
    });

    const hint = this.add
      .text(x + boxW - 18, y + boxH - 14, 'E ▸', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '14px',
        color: '#9a86d8'
      })
      .setOrigin(1, 1);
    this.tweens.add({ targets: hint, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.dialogueSpeaker = speaker;
    this.dialogueBody = body;
    this.dialogueBox.add([bg, speaker, body, hint]);
  }

  isDialogueActive() {
    return this.dialogue && this.dialogue.active;
  }

  showDialogue(speaker, lines, onComplete) {
    this.dialogue.active = true;
    this.dialogue.lines = lines;
    this.dialogue.index = 0;
    this.dialogue.onComplete = onComplete || null;
    this.dialogueSpeaker.setText(speaker || '');
    this.dialogueBody.setText(lines[0] || '');
    this.dialogueBox.setVisible(true).setAlpha(0);
    this.tweens.add({ targets: this.dialogueBox, alpha: 1, duration: 140 });
  }

  // Advance to the next line, or close and fire onComplete. Returns true if it
  // consumed the input (so the caller skips other interactions).
  advanceDialogue() {
    if (!this.dialogue.active) return false;
    this.dialogue.index += 1;
    if (this.dialogue.index >= this.dialogue.lines.length) {
      this.dialogue.active = false;
      this.dialogueBox.setVisible(false);
      const cb = this.dialogue.onComplete;
      this.dialogue.onComplete = null;
      if (cb) cb();
    } else {
      this.dialogueBody.setText(this.dialogue.lines[this.dialogue.index]);
    }
    return true;
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
