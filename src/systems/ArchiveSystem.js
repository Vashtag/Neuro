import { GAME_CONFIG, PALETTE } from '../config.js';
import { TEXTURE_KEYS } from '../data/assetManifest.js';
import { ACTION_MESSAGES } from '../data/dialogueData.js';

const T = GAME_CONFIG.tileSize;

// ArchiveSystem: deposit Memory Berries into the Memory Archive, advance the
// stored count, and drive the building's visual states (dim -> full glow + orbs).
export default class ArchiveSystem {
  constructor(scene) {
    this.scene = scene;
    this.state = scene.state;
    this.map = scene.map;
    this.orbs = [];

    // Restore glow if loading a save mid-progress.
    this.updateVisual(true);
  }

  deposit() {
    const arch = this.state.archive;
    const inv = this.state.inventory;
    const carried = inv.memoryBerries;
    const ui = this.scene.ui;

    if (carried <= 0) {
      ui.showMessage(ACTION_MESSAGES.archiveWaiting);
      this.scene.sfx('unavailable');
      return;
    }

    inv.memoryBerries = 0;
    arch.memoryBerriesArchived = Math.min(
      arch.memoryBerriesArchived + carried,
      arch.requiredMemoryBerries
    );
    const firstDeposit = !this.state.tutorial.depositedFirstBerry;
    this.state.tutorial.depositedFirstBerry = true;

    this.scene.sfx('archive');
    this.updateVisual();
    this.scene.syncUI(['memoryBerry', 'archive']);
    this.scene.updateFieldNotes();

    const n = arch.memoryBerriesArchived;
    const req = arch.requiredMemoryBerries;
    ui.showMessage(`${ACTION_MESSAGES.archiveSummary(carried)} (${n}/${req})`, 2600);

    if (firstDeposit) {
      this.scene.time.delayedCall(1400, () => this.scene.talkToHebb());
    }

    // Reaching the requirement clears the Forgetting Fog.
    if (n >= req && !arch.fogCleared) {
      arch.fogCleared = true;
      this.scene.time.delayedCall(900, () => this.scene.handleArchiveComplete());
    }
  }

  // Glow overlay alpha scales with progress; floating memory orbs appear at 3/5.
  updateVisual(instant = false) {
    const glow = this.map.archiveGlowSprite;
    const arch = this.state.archive;
    const ratio = arch.memoryBerriesArchived / arch.requiredMemoryBerries;
    if (glow) {
      if (instant) glow.setAlpha(ratio);
      else this.scene.tweens.add({ targets: glow, alpha: ratio, duration: 700, ease: 'Sine.easeInOut' });
    }
    if (arch.memoryBerriesArchived >= 3 && this.orbs.length === 0) {
      this.spawnOrbs();
    }
  }

  spawnOrbs() {
    // A few warm memory orbs drifting above the Archive (tiles 17-21, rows 6-8).
    const baseX = 19 * T; // archive center-ish
    const baseY = 6 * T;
    for (let i = 0; i < 4; i += 1) {
      const ox = baseX + (i - 1.5) * 22;
      const orb = this.scene.add
        .image(ox, baseY + 8, TEXTURE_KEYS.orb)
        .setDepth(9 * T)
        .setAlpha(0);
      this.scene.tweens.add({ targets: orb, alpha: 0.9, duration: 600, delay: i * 120 });
      this.scene.tweens.add({
        targets: orb,
        y: baseY - 10,
        duration: 1600 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.orbs.push(orb);
    }
  }
}
