// ============================================================================
// Neurobloom — generated drop-in asset manifest
// ----------------------------------------------------------------------------
// Paste this `ASSET_FILES` over the empty one in src/data/assetManifest.js.
// PreloadScene loads each PNG by key; TextureFactory then SKIPS the matching
// programmatic placeholder (it only generates keys that don't already exist),
// so this swaps in real art with ZERO game-logic changes.
//
// Paths are relative to the Vite `public/` root — copy this folder so the files
// live at  public/assets/...  in the repo.
//
// Texture keys come from TEXTURE_KEYS (assetManifest.js) and GEN_KEYS
// (systems/TextureFactory.js). Character directions + item icons + the archive
// glow overlay are GEN_KEYS string values; listing them here loads them too.
// ============================================================================

export const ASSET_FILES = {
  images: [
    // --- tiles (32x32) ---
    { key: 'tile_neural_ground',     url: 'assets/tiles/tile_neural_ground.png' },
    { key: 'tile_neural_ground_alt', url: 'assets/tiles/tile_neural_ground_alt.png' },
    { key: 'tile_path',              url: 'assets/tiles/tile_path.png' },
    { key: 'tile_soil',              url: 'assets/tiles/tile_soil.png' },
    { key: 'tile_soil_tilled',       url: 'assets/tiles/tile_soil_tilled.png' },
    { key: 'tile_soil_watered',      url: 'assets/tiles/tile_soil_watered.png' },
    { key: 'tile_water',             url: 'assets/tiles/tile_water.png' },
    { key: 'tile_border',            url: 'assets/tiles/tile_border.png' },
    { key: 'tile_fog',               url: 'assets/tiles/tile_fog.png' },
    { key: 'tile_teaser',            url: 'assets/tiles/tile_teaser.png' },

    // --- characters (24x34) ---  GEN_KEYS: player_down/up/side, hebb_down
    { key: 'player_down', url: 'assets/characters/player_down.png' },
    { key: 'player_up',   url: 'assets/characters/player_up.png' },
    { key: 'player_side', url: 'assets/characters/player_side.png' },
    { key: 'hebb_down',   url: 'assets/characters/dr_hebb_down.png' },
    // dr_hebb_side.png is provided as an extra (side-facing Hebb) if you add a key for it.

    // --- crops: Memory Berry growth stages (32x32) ---
    { key: 'crop_memory_berry_0', url: 'assets/crops/crop_memory_berry_0.png' },
    { key: 'crop_memory_berry_1', url: 'assets/crops/crop_memory_berry_1.png' },
    { key: 'crop_memory_berry_2', url: 'assets/crops/crop_memory_berry_2.png' },
    { key: 'crop_memory_berry_3', url: 'assets/crops/crop_memory_berry_3.png' },

    // --- buildings ---
    { key: 'building_soma_cottage',       url: 'assets/buildings/building_soma_cottage.png' },        // 160x96
    { key: 'building_memory_archive',     url: 'assets/buildings/building_memory_archive.png' },      // 160x96
    { key: 'building_memory_archive_glow',url: 'assets/buildings/building_memory_archive_glow.png' }, // 160x96 overlay
    { key: 'building_hebb_hut',           url: 'assets/buildings/building_hebb_hut.png' },            // 128x96
    { key: 'building_signpost',           url: 'assets/tiles/building_signpost.png' },                // 32x32

    // --- item / tool icons (24x24)  GEN_KEYS ---
    { key: 'icon_neurohoe',       url: 'assets/icons/icon_neurohoe.png' },
    { key: 'icon_recallcan',      url: 'assets/icons/icon_recallcan.png' },
    { key: 'icon_seedpouch',      url: 'assets/icons/icon_seedpouch.png' },
    { key: 'icon_archivesatchel', url: 'assets/icons/icon_archivesatchel.png' },
    { key: 'icon_memoryseed',     url: 'assets/icons/icon_memoryseed.png' },
    { key: 'icon_memoryberry',    url: 'assets/icons/icon_memoryberry.png' },

    // --- fx / ui ---
    { key: 'fx_sparkle',  url: 'assets/fx/fx_sparkle.png' },   // 12x12
    { key: 'fx_droplet',  url: 'assets/fx/fx_droplet.png' },   // 8x10
    { key: 'fx_orb',      url: 'assets/fx/fx_orb.png' },       // 14x14
    { key: 'ui_prompt_e', url: 'assets/ui/ui_prompt_e.png' }   // 22x22
  ],

  // Audio is still synthesized at runtime by SoundManager — no files needed.
  audio: []
};

// ----------------------------------------------------------------------------
// OPTIONAL UI PANEL ART (decorative; NOT auto-wired)
// ----------------------------------------------------------------------------
// UIScene.js draws its panels with Phaser Graphics, so these PNGs are not loaded
// by default. To use them, load each in PreloadScene and draw with this.add.image
// in UIScene instead of the graphics calls:
//   assets/ui/ui_inventory_bar.png   (220x54)
//   assets/ui/ui_slot_empty.png      (38x38)
//   assets/ui/ui_slot_active.png     (38x38)
//   assets/ui/ui_slot_glow.png       (38x38)
//   assets/ui/ui_dialogue_box.png    (480x120)
//   assets/ui/ui_field_notes.png     (190x130)
//   assets/ui/ui_sleep_prompt.png    (210x96)
//   assets/ui/ui_completion.png      (300x96)
//   assets/ui/ui_checkbox_empty.png  (14x14)
//   assets/ui/ui_checkbox_checked.png(14x14)
