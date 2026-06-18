import Phaser from 'phaser';
import { SCENES, GAME_CONFIG, PALETTE } from '../config.js';
import { GEN_KEYS } from '../systems/TextureFactory.js';
import { FIELD_NOTES } from '../data/dialogueData.js';

// Text colors: parchment panels need dark INK; purple headers/tabs use CREAM.
const FONT = 'Trebuchet MS, sans-serif';
const INK = '#43331c';
const INK_SOFT = '#6a5436';
const CREAM = '#f4ecdf';
const GOLD = '#f6d785';

// UIScene: transparent overlay above GameScene. Inventory bar, Field Notes,
// dialogue box, confirm/sleep prompt, completion overlay and transient messages.
// Panels use the Claude Design pixel-art frames (nineslice) with text on top.
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
    const barH = 50;
    const bar = this.add.container(0, 0).setDepth(900);

    // Subtle dark backing strip keeps the Day / Archive text readable.
    const bg = this.add.graphics();
    bg.fillStyle(PALETTE.uiPanel, 0.82);
    bg.fillRoundedRect(8, 6, w - 16, barH, 12);
    bg.lineStyle(2, PALETTE.uiPanelEdge, 1);
    bg.strokeRoundedRect(8, 6, w - 16, barH, 12);
    bar.add(bg);

    const cy = 6 + barH / 2;
    this.invSlots = {};

    this.dayText = this.add
      .text(26, cy, 'Day 1', { fontFamily: FONT, fontSize: '18px', color: GOLD, fontStyle: 'bold' })
      .setOrigin(0, 0.5);
    bar.add(this.dayText);

    // Each tool sits inside a parchment slot frame (ui_slot_empty), which swaps
    // to ui_slot_glow on a flash.
    const addSlot = (id, x, key, withCount) => {
      const frame = this.add.image(x, cy, 'ui_slot_empty').setOrigin(0.5);
      const icon = this.add.image(x, cy, key).setOrigin(0.5);
      bar.add(frame);
      bar.add(icon);
      let count = null;
      if (withCount) {
        count = this.add
          .text(x + 13, cy + 9, '0', { fontFamily: FONT, fontSize: '13px', color: CREAM, fontStyle: 'bold' })
          .setOrigin(0.5);
        // Small dark chip behind the count for legibility on the parchment slot.
        const chip = this.add.graphics();
        chip.fillStyle(0x2a2140, 0.85);
        chip.fillCircle(x + 13, cy + 9, 9);
        bar.add(chip);
        bar.add(count);
      }
      this.invSlots[id] = { frame, icon, count, x };
    };

    let x = 116;
    const gap = 50;
    addSlot('neuroHoe', x, GEN_KEYS.iconHoe, false); x += gap;
    addSlot('recallCan', x, GEN_KEYS.iconCan, false); x += gap;
    addSlot('seedPouch', x, GEN_KEYS.iconPouch, true); x += gap;
    addSlot('memoryBerry', x, GEN_KEYS.iconBerry, true); x += gap;
    addSlot('archiveSatchel', x, GEN_KEYS.iconSatchel, false); x += gap + 8;

    this.archiveText = this.add
      .text(x, cy, 'Archive 0/5', { fontFamily: FONT, fontSize: '16px', color: CREAM })
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
      s.icon.setAlpha(owned ? 1 : 0.25);
      s.frame.setAlpha(owned ? 1 : 0.5);
    };
    setOwned('neuroHoe', inv.hasNeuroHoe);
    setOwned('recallCan', inv.hasRecallCan);
    setOwned('seedPouch', inv.hasSeedPouch);
    setOwned('archiveSatchel', inv.hasArchiveSatchel);
    this.invSlots.memoryBerry.icon.setAlpha(inv.memoryBerries > 0 ? 1 : 0.4);
    this.invSlots.memoryBerry.frame.setAlpha(1);

    if (this.invSlots.seedPouch.count) this.invSlots.seedPouch.count.setText(`${inv.memorySeeds}`);
    if (this.invSlots.memoryBerry.count) this.invSlots.memoryBerry.count.setText(`${inv.memoryBerries}`);

    this.archiveText.setText(
      `Archive ${state.archive.memoryBerriesArchived}/${state.archive.requiredMemoryBerries}`
    );

    flash.forEach((id) => this.flashSlot(id));
  }

  // Pulse a slot (swapping its frame to the glow art) when an action happens.
  flashSlot(id) {
    if (id === 'archive') {
      this.tweens.add({ targets: this.archiveText, scale: 1.3, duration: 130, yoyo: true });
      return;
    }
    const s = this.invSlots[id];
    if (!s) return;
    s.frame.setTexture('ui_slot_glow');
    this.tweens.add({
      targets: [s.frame, s.icon],
      scale: 1.35,
      duration: 140,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => s.frame.setTexture('ui_slot_empty')
    });
  }

  // --- Field Notes panel (top-right) ---
  buildFieldNotes() {
    const { canvasWidth: w } = GAME_CONFIG;
    const panelW = 258;
    const panelH = 190;
    const x = w - panelW - 14;
    const y = 64;

    this.fieldNotesPanel = this.add.container(0, 0).setDepth(880);
    // Plain stretched image (renders under Canvas + WebGL; nineslice is
    // WebGL-only). panelW/panelH track the art's ~1.46:1 aspect to avoid distortion.
    const bg = this.add.image(x, y, 'ui_field_notes').setOrigin(0, 0).setDisplaySize(panelW, panelH);

    this.fieldNotesTitle = this.add
      .text(x + panelW / 2, y + 23, 'Field Notes', {
        fontFamily: FONT,
        fontSize: '15px',
        color: CREAM,
        fontStyle: 'bold'
      })
      .setOrigin(0.5, 0.5);

    // Body indented past the art's baked checkbox column on the left.
    this.fieldNotesBody = this.add.text(x + 42, y + 46, '', {
      fontFamily: FONT,
      fontSize: '13px',
      color: INK,
      wordWrap: { width: panelW - 58 },
      lineSpacing: 4
    });
    this.fieldNotesPanel.add([bg, this.fieldNotesTitle, this.fieldNotesBody]);
  }

  refreshFieldNotes(state) {
    if (!this.fieldNotesTitle) return;
    const note = FIELD_NOTES[state.fieldNotesStep] || FIELD_NOTES.talk_to_hebb;
    const body = note.body.replace('{n}', state.archive.memoryBerriesArchived);
    this.fieldNotesTitle.setText(note.title);
    this.fieldNotesBody.setText(body);
  }

  // --- dialogue box (bottom) ---
  buildDialogue() {
    const { canvasWidth: w, canvasHeight: h } = GAME_CONFIG;
    const boxW = 720; // ~ matches the 480x120 art aspect to limit stretch
    const boxH = 150;
    const x = (w - boxW) / 2;
    const y = h - boxH - 18;

    this.dialogue = { active: false, lines: [], index: 0, onComplete: null };
    this.dialogueBox = this.add.container(0, 0).setDepth(1200).setVisible(false);

    const bg = this.add.image(x, y, 'ui_dialogue_box').setOrigin(0, 0).setDisplaySize(boxW, boxH);

    // Speaker label sits over the purple tab (top-left), cream text.
    const speaker = this.add.text(x + 34, y + 12, '', {
      fontFamily: FONT,
      fontSize: '16px',
      color: CREAM,
      fontStyle: 'bold'
    });

    const body = this.add.text(x + 30, y + 50, '', {
      fontFamily: FONT,
      fontSize: '18px',
      color: INK,
      wordWrap: { width: boxW - 60 },
      lineSpacing: 4
    });

    this.dialogueSpeaker = speaker;
    this.dialogueBody = body;
    this.dialogueBox.add([bg, speaker, body]);
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

  // --- yes/no confirm modal, themed as the sleep prompt ---
  buildConfirm() {
    const { canvasWidth: w, canvasHeight: h } = GAME_CONFIG;
    this.confirm = { active: false, onYes: null, onNo: null };

    this.confirmBox = this.add.container(0, 0).setDepth(1300).setVisible(false);
    const bw = 420;
    const bh = 192; // 210x96 art scaled ~2x
    const x = (w - bw) / 2;
    const y = (h - bh) / 2;

    const bg = this.add.image(x + bw / 2, y + bh / 2, 'ui_sleep_prompt').setDisplaySize(bw, bh);

    // The sleep prompt art is a DARK night panel -> cream text.
    this.confirmText = this.add
      .text(x + bw / 2, y + 44, '', {
        fontFamily: FONT,
        fontSize: '16px',
        color: CREAM,
        align: 'center',
        wordWrap: { width: bw - 90 }
      })
      .setOrigin(0.5);

    // Labels over the two baked buttons (left = Yes/purple, right = No/dark).
    this.confirmYesLabel = this.add
      .text(x + bw * 0.3, y + bh - 38, '', { fontFamily: FONT, fontSize: '16px', color: CREAM, fontStyle: 'bold' })
      .setOrigin(0.5);
    this.confirmNoLabel = this.add
      .text(x + bw * 0.7, y + bh - 38, '', { fontFamily: FONT, fontSize: '16px', color: CREAM })
      .setOrigin(0.5);

    this.confirmBox.add([bg, this.confirmText, this.confirmYesLabel, this.confirmNoLabel]);
  }

  isConfirmActive() {
    return this.confirm && this.confirm.active;
  }

  showConfirm(message, yesLabel, noLabel, onYes, onNo) {
    this.confirm.active = true;
    this.confirm.onYes = onYes || null;
    this.confirm.onNo = onNo || null;
    this.confirmText.setText(message);
    this.confirmYesLabel.setText(`[E] ${yesLabel}`);
    this.confirmNoLabel.setText(`[Esc] ${noLabel}`);
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
    const bh = 180; // 300x96 art -> uniform ~1.87x scale, no distortion
    const x = (w - bw) / 2;
    const y = (h - bh) / 2;
    const bg = this.add.image(x, y, 'ui_completion').setOrigin(0, 0).setDisplaySize(bw, bh);

    const titleText = this.add
      .text(w / 2, y + 44, title, { fontFamily: FONT, fontSize: '28px', color: '#5a3a1e', fontStyle: 'bold' })
      .setOrigin(0.5);

    const bodyText = this.add
      .text(w / 2, y + 104, body, {
        fontFamily: FONT,
        fontSize: '17px',
        color: INK,
        align: 'center',
        lineSpacing: 6,
        wordWrap: { width: bw - 90 }
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(w / 2, y + bh - 26, 'Press E to continue', { fontFamily: FONT, fontSize: '14px', color: INK_SOFT })
      .setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: 0.4, duration: 800, yoyo: true, repeat: -1 });

    c.add([dim, bg, titleText, bodyText, hint]);
    this.completionBox = c;
    this.tweens.add({ targets: c, alpha: 1, duration: 400 });
  }

  dismissCompletion() {
    if (!this.completion || !this.completion.active) return false;
    this.completion.active = false;
    if (this.completionBox) {
      const box = this.completionBox;
      this.tweens.add({ targets: box, alpha: 0, duration: 300, onComplete: () => box.destroy() });
    }
    return true;
  }

  // --- transient message toast (bottom-center, code-drawn dark) ---
  buildToast() {
    const { canvasWidth: w, canvasHeight: h } = GAME_CONFIG;
    this.toast = this.add.container(w / 2, h - 96).setDepth(1000).setAlpha(0);
    const bg = this.add.graphics();
    this.toastBg = bg;
    const text = this.add
      .text(0, 0, '', { fontFamily: FONT, fontSize: '17px', color: CREAM, align: 'center', wordWrap: { width: 520 } })
      .setOrigin(0.5);
    this.toastText = text;
    this.toast.add([bg, text]);
    this.toastTween = null;
  }

  showMessage(message, duration = 2200) {
    if (!this.toast) return;
    this.toastText.setText(message);
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
          this.toastTween = this.tweens.add({ targets: this.toast, alpha: 0, duration: 280, ease: 'Sine.easeIn' });
        });
      }
    });
  }
}
