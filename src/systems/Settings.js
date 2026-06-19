// Settings: small localStorage-backed preferences, separate from the game save
// so they persist across New Game. Volumes are 0..1.
const KEY = 'neurobloom_settings_v1';

const DEFAULTS = { musicVolume: 0.6, sfxVolume: 0.8 };

export const Settings = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch (e) {
      return { ...DEFAULTS };
    }
  },

  save(settings) {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch (e) {
      /* ignore */
    }
  },

  // Push the loaded volumes into a SoundManager (applies live if audio is up).
  apply(settings, sound) {
    if (!sound) return;
    sound.setMusicVolume(settings.musicVolume);
    sound.setSfxVolume(settings.sfxVolume);
  }
};
