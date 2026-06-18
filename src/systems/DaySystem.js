import { PLAYER_START_TILE } from '../data/mapData.js';
import { ACTION_MESSAGES } from '../data/dialogueData.js';
import { SaveSystem } from './SaveSystem.js';

// DaySystem: sleep-to-advance days. Prompts at the cottage door, then runs the
// consolidation sequence: fade, advance day, grow watered crops, autosave, wake.
export default class DaySystem {
  constructor(scene) {
    this.scene = scene;
    this.busy = false;
  }

  promptSleep() {
    if (this.busy) return;
    this.scene.ui.showConfirm(
      ACTION_MESSAGES.sleepPrompt,
      'Yes',
      'Not yet',
      () => this.doSleep(),
      () => {}
    );
  }

  doSleep() {
    if (this.busy) return;
    this.busy = true;
    const scene = this.scene;
    const cam = scene.cameras.main;

    scene.player.setInputLocked(true);
    scene.sfx('sleep');

    cam.fadeOut(600, 16, 12, 28);
    cam.once('camerafadeoutcomplete', () => {
      const state = scene.state;

      // Advance the day and consolidate.
      state.day += 1;
      const grew = scene.farming.growOvernight();
      state.tutorial.sleptFirstTime = true;

      // Autosave on sleep (the only save point).
      SaveSystem.save(state);

      // Wake outside Soma Cottage (MVP always wakes at the start tile).
      const start = scene.map.tileToWorldCenter(PLAYER_START_TILE.x, PLAYER_START_TILE.y);
      scene.player.setPosition(start.x, start.y);
      scene.player.lastDirection = 'down';
      scene.player.setFrameForDirection();

      scene.syncUI();
      scene.updateFieldNotes();

      cam.fadeIn(700, 16, 12, 28);
      cam.once('camerafadeincomplete', () => {
        scene.player.setInputLocked(false);
        this.busy = false;
        scene.ui.showMessage(ACTION_MESSAGES.sleep, 2000);
        scene.time.delayedCall(900, () => {
          scene.ui.showMessage(grew ? ACTION_MESSAGES.grew : ACTION_MESSAGES.noGrowth, 2400);
        });
      });
    });
  }
}
