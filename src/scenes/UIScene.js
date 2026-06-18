import Phaser from 'phaser';
import { SCENES, GAME_CONFIG, PALETTE } from '../config.js';
import { GEN_KEYS } from '../systems/TextureFactory.js';
import { FIELD_NOTES } from '../data/dialogueData.js';

// UIScene: transparent overlay above GameScene. Hosts the inventory bar, Field
// Notes panel, dialogue box, prompts and transient messages. Built up across
// milestones; M4 adds the transient message "toast".
export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.UI, active: false });
  }

  create() {
    this.scene.bringToTop();
    this.buildInventoryBar();
    this.buildFieldNotes();
    this.buildToast();
    this.buildDialogue();
    this.buildConfirm();

    // Populate from the (already created) GameScene state.
    const gs = this.scene.get(SCENES.GAME);
    if (gs && gs.state && gs.syncUI) gs.syncUI();
  }

  // --- inventory / status bar (top) ---
  buildInventoryBar() {
    const { canvasWidth: w } = GAME_CONFIG;
    const barH = 46;
    const bar = this.add.container(0, 0).setDepth(900);

    const bg = this.add.graphics();
    bg.fillStyle(PALETTE.uiPanel, 0.9);
    bg.fillRoundedRect(8, 8, w - 16, barH, 10);
    bg.lineStyle(2, PALETTE.uiPanelEdge, 1);
    bg.strokeRoundedRect(8, 8, w - 16, barH, 10);
    bar.add(bg);

    const cy = 8 + barH / 2;
    this.invSlots = {};

    // Day label.
    this.dayText = this.add
      .text(26, cy, 'Day 1', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '18px',
        color: '#f6d785',
        fontStyle: 'bold'
      })
      .setOrigin(0, 0.5);
    bar.add(this.dayText);

    // Helper to add an icon slot with optional count text.
    const addSlot = (id, x, key, withCount) => {
      const icon = this.add.image(x, cy, key).setOrigin(0.5);
      bar.add(icon);
      let count = null;
      if (withCount) {
        count = this.add
          .text(x + 14, cy + 6, '0', {
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '14px',
            color: '#f4ecdf',
            fontStyle: 'bold'
          })
          .setOrigin(0.5);
        bar.add(count);
      }
      this.invSlots[id] = { icon, count, x };
      return x;
    };

    let x = 110;
    const gap = 56;
    addSlot('neuroHoe', x, GEN_KEYS.iconHoe, false); x += gap;
    addSlot('recallCan', x, GEN_KEYS.iconCan, false); x += gap;
    addSlot('seedPouch', x, GEN_KEYS.iconPouch, true); x += gap;
    addSlot('memoryBerry', x, GEN_KEYS.iconBerry, true); x += gap;
    addSlot('archiveSatchel', x, GEN_KEYS.iconSatchel, false); x += gap + 6;

    // Archive progress.
    this.archiveText = this.add
      .text(x + 6, cy, 'Archive 0/5', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '16px',
        color: '#f4ecdf'
      })
      .setOrigin(0, 0.5);
    bar.add(this.archiveText);

    this.inventoryBar = bar;
  }

  refreshInventory(state, flash = []) {
    if (!this.invSlots) return;
    const inv = state.inventory;
    this.dayText.setText(`Day ${state.day}`);

    const setOwned = (id, owned) => {
      const s = this.invSlots[id];
      if (!s) return;
      s.icon.setAlpha(owned ? 1 : 0.28);
    };
    setOwned('neuroHoe', inv.hasNeuroHoe);
    setOwned('recallCan', inv.hasRecallCan);
    setOwned('seedPouch', inv.hasSeedPouch);
    setOwned('archiveSatchel', inv.hasArchiveSatchel);

    // Berry icon dims when none carried but stays "owned" once satchel exists.
    this.invSlots.memoryBerry.icon.setAlpha(inv.memoryBerries > 0 ? 1 : 0.4);

    if (this.invSlots.seedPouch.count) this.invSlots.seedPouch.count.setText(`${inv.memorySeeds}`);
    if (this.invSlots.memoryBerry.count) this.invSlots.memoryBerry.count.setText(`${inv.memoryBerries}`);

    this.archiveText.setText(`Archive ${state.archive.memoryBerriesArchived}/${state.archive.requiredMemoryBerries}`);

    flash.forEach((id) => this.flashSlot(id));
  }

  // Pulse an inventory slot (and the archive label) when an action happens.
  flashSlot(id) {
    let target = this.invSlots[id] && this.invSlots[id].icon;
    if (id === 'archive') target = this.archiveText;
    if (!target) return;
    this.tweens.add({
      targets: target,
      scale: 1.45,
      duration: 130,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }

  // --- Field Notes panel (top-right) ---
  buildFieldNotes() {
    const { canvasWidth: w } = GAME_CONFIG;
    const panelW = 250;
    const x = w - panelW - 14;
    const y = 64;

    this.fieldNotesPanel = this.add.container(0, 0).setDepth(880);
    this.fieldNotesBg = this.add.graphics();
    this.fieldNotesTitle = this.add.text(x + 14, y + 10, 'Field Notes', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '16px',
      color: '#f6d785',
      fontStyle: 'bold'
    });
    this.fieldNotesBody = this.add.text(x + 14, y + 34, '', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '14px',
      color: '#f4ecdf',
      wordWrap: { width: panelW - 28 },
      lineSpacing: 3
    });
    this.fieldNotesPanel.add([this.fieldNotesBg, this.fieldNotesTitle, this.fieldNotesBody]);
    this._fnGeom = { x, y, panelW };
  }

  refreshFieldNotes(state) {
    if (!this.fieldNotesTitle) return;
    const note = FIELD_NOTES[state.fieldNotesStep] || FIELD_NOTES.talk_to_hebb;
    const body = note.body.replace('{n}', state.archive.memoryBerriesArchived);
    this.fieldNotesTitle.setText(note.title);
    this.fieldNotesBody.setText(body);

    const { x, y, panelW } = this._fnGeom;
    const h = 34 + this.fieldNotesBody.height + 16;
    this.fieldNotesBg.clear();
    this.fieldNotesBg.fillStyle(PALETTE.uiPanel, 0.9);
    this.fieldNotesBg.fillRoundedRect(x, y, panelW, h, 10);
    this.fieldNotesBg.lineStyle(2, PALETTE.uiPanelEdge, 1);
    this.fieldNotesBg.strokeRoundedRect(x, y, panelW, h, 10);
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

  // --- yes/no confirm modal (e.g. sleep prompt) ---
  buildConfirm() {
    const { canvasWidth: w, canvasHeight: h } = GAME_CONFIG;
    this.confirm = { active: false, onYes: null, onNo: null };

    this.confirmBox = this.add.container(0, 0).setDepth(1300).setVisible(false);
    const bw = 440;
    const bh = 120;
    const x = (w - bw) / 2;
    const y = (h - bh) / 2;

    const bg = this.add.graphics();
    bg.fillStyle(PALETTE.uiPanel, 0.97);
    bg.fillRoundedRect(x, y, bw, bh, 12);
    bg.lineStyle(3, PALETTE.uiPanelEdge, 1);
    bg.strokeRoundedRect(x, y, bw, bh, 12);

    this.confirmText = this.add
      .text(x + bw / 2, y + 36, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '18px',
        color: '#f4ecdf',
        align: 'center',
        wordWrap: { width: bw - 40 }
      })
      .setOrigin(0.5);

    this.confirmOptions = this.add
      .text(x + bw / 2, y + bh - 26, '', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '16px',
        color: '#f6d785'
      })
      .setOrigin(0.5);

    this.confirmBox.add([bg, this.confirmText, this.confirmOptions]);
  }

  isConfirmActive() {
    return this.confirm && this.confirm.active;
  }

  showConfirm(message, yesLabel, noLabel, onYes, onNo) {
    this.confirm.active = true;
    this.confirm.onYes = onYes || null;
    this.confirm.onNo = onNo || null;
    this.confirmText.setText(message);
    this.confirmOptions.setText(`[E] ${yesLabel}      [Esc] ${noLabel}`);
    this.confirmBox.setVisible(true).setAlpha(0);
    this.tweens.add({ targets: this.confirmBox, alpha: 1, duration: 140 });
  }

  resolveConfirm(yes) {
    if (!this.confirm.active) return false;
    this.confirm.active = false;
    this.confirmBox.setVisible(false);
    const cb = yes ? this.confirm.onYes : this.confirm.onNo;
    this.confirm.onYes = null;
    this.confirm.onNo = null;
    if (cb) cb();
    return true;
  }

  // --- completion / end-of-build overlay ---
  isCompletionActive() {
    return this.completion && this.completion.active;
  }

  showCompletion(title, body) {
    const { canvasWidth: w, canvasHeight: h } = GAME_CONFIG;
    if (!this.completion) this.completion = { active: false };
    if (this.completion.active) return;
    this.completion.active = true;

    const c = this.add.container(0, 0).setDepth(1500).setAlpha(0);

    const dim = this.add.graphics();
    dim.fillStyle(0x0c0a16, 0.6);
    dim.fillRect(0, 0, w, h);

    const bw = 560;
    const bh = 240;
    const x = (w - bw) / 2;
    const y = (h - bh) / 2;
    const bg = this.add.graphics();
    bg.fillStyle(PALETTE.uiPanel, 0.98);
    bg.fillRoundedRect(x, y, bw, bh, 16);
    bg.lineStyle(3, PALETTE.archiveGlow, 1);
    bg.strokeRoundedRect(x, y, bw, bh, 16);

    const titleText = this.add
      .text(w / 2, y + 44, title, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '30px',
        color: '#f6d785',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    const bodyText = this.add
      .text(w / 2, y + 120, body, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '17px',
        color: '#f4ecdf',
        align: 'center',
        lineSpacing: 6,
        wordWrap: { width: bw - 60 }
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(w / 2, y + bh - 22, 'Press E to continue', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '14px',
        color: '#9a86d8'
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });

    c.add([dim, bg, titleText, bodyText, hint]);
    this.completionBox = c;
    this.tweens.add({ targets: c, alpha: 1, duration: 400 });
  }

  dismissCompletion() {
    if (!this.completion || !this.completion.active) return false;
    this.completion.active = false;
    if (this.completionBox) {
      const box = this.completionBox;
      this.tweens.add({
        targets: box,
        alpha: 0,
        duration: 300,
        onComplete: () => box.destroy()
      });
    }
    return true;
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
