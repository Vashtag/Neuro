// Central, serializable game state. One object holds everything that is saved
// to localStorage on sleep. Systems read and mutate this; UIScene renders it.

export function createDefaultGameState() {
  return {
    day: 1,
    inventory: {
      hasNeuroHoe: false,
      hasRecallCan: false,
      hasSeedPouch: false,
      hasArchiveSatchel: false,
      memorySeeds: 0,
      memoryBerries: 0,
      dreamSeeds: 0,
      dreamBlooms: 0
    },
    archive: {
      memoryBerriesArchived: 0,
      requiredMemoryBerries: 5,
      fogCleared: false
    },
    grove: {
      dreamBloomsOffered: 0,
      requiredDreamBlooms: 3,
      restored: false
    },
    tutorial: {
      metDrHebb: false,
      receivedTools: false,
      plantedFirstSeed: false,
      wateredFirstCrop: false,
      sleptFirstTime: false,
      harvestedFirstBerry: false,
      depositedFirstBerry: false,
      reachedTeaserPath: false,
      hebbPostFogLine: 0,
      // Stage 2
      receivedDreamSeeds: false,
      offeredFirstDream: false,
      groveRestored: false
    },
    fieldNotesStep: 'talk_to_hebb',
    // Each entry: { x, y, soilState, wateredToday, crop }
    // crop: { type, growthStage, wateredNights, ready } | null
    crops: [],
    player: {
      startAtCottage: true
    }
  };
}

// Derived helpers — single source of truth for "what stage is the player at".
export function hasPlantedCrop(state) {
  return state.crops.some((c) => c.crop);
}

export function hasUnwateredPlantedCrop(state) {
  return state.crops.some((c) => c.crop && !c.crop.ready && !c.wateredToday);
}

export function hasWateredCrop(state) {
  return state.crops.some((c) => c.crop && c.wateredToday);
}

export function hasReadyCrop(state) {
  return state.crops.some((c) => c.crop && c.crop.ready);
}

export function hasReadyCropOfType(state, cropType) {
  return state.crops.some((c) => c.crop && c.crop.ready && c.cropType === cropType);
}

export function carryingBerries(state) {
  return state.inventory.memoryBerries > 0;
}

export function carryingDreamBlooms(state) {
  return state.inventory.dreamBlooms > 0;
}
