import { GAME_CONFIG } from '../config.js';
import { createDefaultGameState } from '../data/gameState.js';

// SaveSystem: localStorage persistence. Autosave happens only on sleep.
// load() sanitizes against the default shape so older/partial saves never crash.
const KEY = GAME_CONFIG.saveKey;

export const SaveSystem = {
  save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn('[Neurobloom] save failed:', e);
      return false;
    }
  },

  hasSave() {
    try {
      return localStorage.getItem(KEY) != null;
    } catch (e) {
      return false;
    }
  },

  load() {
    let raw = null;
    try {
      raw = localStorage.getItem(KEY);
    } catch (e) {
      return createDefaultGameState();
    }
    if (!raw) return createDefaultGameState();
    try {
      return sanitize(JSON.parse(raw));
    } catch (e) {
      console.warn('[Neurobloom] corrupt save, starting fresh:', e);
      return createDefaultGameState();
    }
  },

  reset() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {
      /* ignore */
    }
  }
};

// Fill any missing fields from the default so the game state is always complete.
function sanitize(loaded) {
  const def = createDefaultGameState();
  const out = { ...def, ...loaded };
  out.inventory = { ...def.inventory, ...(loaded.inventory || {}) };
  out.archive = { ...def.archive, ...(loaded.archive || {}) };
  out.grove = { ...def.grove, ...(loaded.grove || {}) };
  out.cortex = { ...def.cortex, ...(loaded.cortex || {}) };
  out.codex = { ...def.codex, ...(loaded.codex || {}) };
  out.tutorial = { ...def.tutorial, ...(loaded.tutorial || {}) };
  out.player = { ...def.player, ...(loaded.player || {}) };
  out.crops = Array.isArray(loaded.crops) ? loaded.crops : def.crops;
  return out;
}
