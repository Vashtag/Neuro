// Central asset manifest.
//
// The MVP renders with PROGRAMMATIC placeholder textures generated at runtime
// (see systems/TextureFactory.js), so no image/audio files are required to run.
//
// This manifest documents the texture KEYS the game uses and the file paths
// where real pixel-art assets can later be dropped in. PreloadScene checks each
// optional file; if present it loads it, otherwise the programmatic placeholder
// for that key is used. This lets art be replaced WITHOUT touching game logic.

export const TEXTURE_KEYS = {
  // characters
  player: 'player',
  drHebb: 'dr_hebb',
  // tiles (one key per tile visual)
  neuralGround: 'tile_neural_ground',
  neuralGroundAlt: 'tile_neural_ground_alt',
  path: 'tile_path',
  soil: 'tile_soil',
  soilTilled: 'tile_soil_tilled',
  soilWatered: 'tile_soil_watered',
  water: 'tile_water',
  border: 'tile_border',
  fog: 'tile_fog',
  teaser: 'tile_teaser',
  // crops (4 growth stages)
  cropSeed: 'crop_memory_berry_0',
  cropSprout: 'crop_memory_berry_1',
  cropBud: 'crop_memory_berry_2',
  cropReady: 'crop_memory_berry_3',
  // buildings
  somaCottage: 'building_soma_cottage',
  memoryArchive: 'building_memory_archive',
  hebbHut: 'building_hebb_hut',
  signpost: 'building_signpost',
  // ui / fx
  promptE: 'ui_prompt_e',
  sparkle: 'fx_sparkle',
  droplet: 'fx_droplet',
  orb: 'fx_orb'
};

// Optional real-art overrides. PreloadScene attempts these; missing files are
// silently ignored and the generated placeholder is used instead.
export const ASSET_FILES = {
  images: [
    { key: TEXTURE_KEYS.player, url: 'assets/sprites/player.png' },
    { key: TEXTURE_KEYS.drHebb, url: 'assets/sprites/dr_hebb.png' },
    { key: TEXTURE_KEYS.somaCottage, url: 'assets/buildings/soma_cottage.png' },
    { key: TEXTURE_KEYS.memoryArchive, url: 'assets/buildings/memory_archive.png' },
    { key: TEXTURE_KEYS.hebbHut, url: 'assets/buildings/hebb_hut.png' }
  ],
  // Audio is synthesized at runtime via the WebAudio SoundManager, so no files
  // are required. Real SFX can be added here later and the SoundManager can be
  // pointed at them.
  audio: [
    // { key: 'sfx_plant', url: 'assets/audio/sfx/plant.wav' },
  ]
};
