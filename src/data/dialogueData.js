// All of Dr. Hebb's stage-based dialogue, action messages, and Field Notes text.
// Pulled verbatim from the dialogue/copy reference so writing stays in one place.

import {
  hasPlantedCrop,
  hasUnwateredPlantedCrop,
  hasWateredCrop,
  hasReadyCrop,
  carryingBerries
} from './gameState.js';

// Dr. Hebb's lines per stage. `id` is used to gate one-time effects (rewards).
export const HEBB_STAGES = {
  intro: {
    id: 'intro',
    lines: [
      'Ah, good. You’re awake. Hippocampus Hollow has become foggy, which is usually a metaphor, but today it is also weather.',
      'The Memory Archive has gone dim. Memories are forming, but they are not being stored properly. Very inconvenient. Terrible for morale.',
      'Take these Memory Seeds. Plant them, give them attention, and let them rest overnight.',
      'In practical terms: press E near the memory soil. The tools will know what to do. Probably.'
    ]
  },
  before_planting: {
    id: 'before_planting',
    lines: [
      'Memory Seeds are fragile. Prepare the soil, plant them carefully, and try not to look too much like a reviewer.',
      'Press E near farm soil to prepare, plant, and water.'
    ]
  },
  after_planting: {
    id: 'after_planting',
    lines: [
      'Encoding has begun. Now the little traces need attention. Around here, attention comes from a watering can. Elegant? No. Effective? Sometimes.',
      'Water planted seeds before sleeping.'
    ]
  },
  ready_to_sleep: {
    id: 'ready_to_sleep',
    lines: [
      'Good. They’ve had attention. Now let them rest. Sleep is when the garden does its quiet work: consolidation, restoration, and absolutely no email.',
      'Go to Soma Cottage and sleep.'
    ]
  },
  after_first_sleep: {
    id: 'after_first_sleep',
    lines: [
      'See? They grew. Memory is rarely instant. Unless it is embarrassing, in which case the brain stores it forever.',
      'Water the sprouts again, then sleep once more.'
    ]
  },
  crops_ready: {
    id: 'crops_ready',
    lines: [
      'Excellent. The Memory Berries are ready. Retrieve them gently. They are episodic, not indestructible.',
      'Press E near glowing Memory Berries to harvest.'
    ]
  },
  carrying: {
    id: 'carrying',
    lines: [
      'Freshly retrieved memories should be archived before they wander off and become anecdotes.',
      'Bring Memory Berries to the Memory Archive.'
    ]
  },
  archived_some: {
    id: 'archived_some',
    lines: [
      'There it is. Long-term storage has accepted the memory. The Archive is only slightly judging us.',
      'A few more should strengthen the pathway.'
    ]
  },
  dream_intro: {
    id: 'dream_intro',
    lines: [
      'You found the grove. Good. It grows Dream Blooms — memories that only settle after proper rest.',
      'Take these Dream Seeds. Plant them in the grove soil, water them, and sleep. They are slow: three nights of rest, minimum. Like a good idea.',
      'When they bloom, bring them to the Dream Altar. It has been waiting. Dramatically.'
    ]
  },
  fog_cleared: {
    id: 'fog_cleared',
    lines: ['Synapse Grove is just ahead. Excellent news, unless the synapses have unionized again.']
  },
  fog_cleared_2: {
    id: 'fog_cleared_2',
    lines: ['Go on, take a look. Try not to step on anything electrically important.']
  }
};

// Choose Dr. Hebb's current stage from game state, following the dialogue ref.
export function selectHebbStage(state) {
  if (!state.tutorial.metDrHebb) return HEBB_STAGES.intro;

  if (state.archive.fogCleared) {
    // Once the player has reached the grove, Dr. Hebb hands over Dream Seeds.
    if (state.tutorial.reachedTeaserPath && !state.tutorial.receivedDreamSeeds) {
      return HEBB_STAGES.dream_intro;
    }
    // Alternate the two post-fog repeat lines.
    return state.tutorial.hebbPostFogLine % 2 === 0
      ? HEBB_STAGES.fog_cleared
      : HEBB_STAGES.fog_cleared_2;
  }

  if (carryingBerries(state) && state.archive.memoryBerriesArchived === 0) {
    return HEBB_STAGES.carrying;
  }
  if (state.archive.memoryBerriesArchived > 0) return HEBB_STAGES.archived_some;
  if (hasReadyCrop(state)) return HEBB_STAGES.crops_ready;

  if (state.tutorial.sleptFirstTime && hasPlantedCrop(state)) {
    return HEBB_STAGES.after_first_sleep;
  }
  if (hasWateredCrop(state)) return HEBB_STAGES.ready_to_sleep;
  if (hasPlantedCrop(state) && hasUnwateredPlantedCrop(state)) {
    return HEBB_STAGES.after_planting;
  }
  return HEBB_STAGES.before_planting;
}

// Short educational action messages.
export const ACTION_MESSAGES = {
  till: 'Memory soil prepared. Encoding likes a clean start.',
  plant: 'Encoding begins. A new memory trace has taken root.',
  water: 'Attention strengthens the trace.',
  sleepPrompt: 'Sleep and let today’s memories consolidate?',
  sleep: 'The day’s memories consolidate overnight.',
  grew: 'Some memory traces strengthened while you slept.',
  noGrowth: 'Some memories needed more attention before they could strengthen.',
  harvest: 'Retrieved: one Memory Berry.',
  archiveSummary: (n) => `Long-term storage restored. Archived ${n} Memory ${n === 1 ? 'Berry' : 'Berries'}.`,
  archiveWaiting: 'The Archive hums softly. It is waiting for retrieved memories.',
  fogBlocked: 'The Forgetting Fog blocks the path. The Archive may need more memories first.',
  fogClear: 'The path is clear. Synapse Grove waits ahead.',
  noSeeds: 'The Seed Pouch is empty. Memory Seeds come from Dr. Hebb.',
  cannotFarm: 'You need Dr. Hebb’s tools before you can work the memory soil.'
};

// Field Notes panel text, keyed by fieldNotesStep. {n} is replaced with the
// archived count at render time.
export const FIELD_NOTES = {
  talk_to_hebb: {
    title: 'Field Notes',
    body: 'Talk to Dr. Hebb outside Soma Cottage.'
  },
  grow_berries: {
    title: 'Field Notes',
    body: 'Grow and archive 5 Memory Berries.\n\nHint:\nPlant seeds, water them, then sleep.\n\nArchived: {n}/5'
  },
  water_and_sleep: {
    title: 'Field Notes',
    body: 'Let the Memory Seeds grow.\n\nHint:\nWater them once each day, then sleep to consolidate.'
  },
  harvest_berries: {
    title: 'Field Notes',
    body: 'Harvest the glowing Memory Berries.'
  },
  archive_berries: {
    title: 'Field Notes',
    body: 'Bring Memory Berries to the Memory Archive.\n\nArchived: {n}/5'
  },
  explore_path: {
    title: 'Field Notes',
    body: 'The Forgetting Fog is clearing.\n\nExplore the restored path north of the Archive.'
  },
  explore_grove: {
    title: 'Field Notes',
    body: 'Synapse Grove is open to the north.\n\nTalk to Dr. Hebb for Dream Seeds.'
  },
  grow_dreams: {
    title: 'Field Notes',
    body: 'Grow Dream Blooms in the grove.\n\nHint:\nWater them, then sleep. They need 3 nights of rest.'
  },
  harvest_dreams: {
    title: 'Field Notes',
    body: 'Harvest the glowing Dream Blooms in the grove.'
  },
  offer_dreams: {
    title: 'Field Notes',
    body: 'Bring Dream Blooms to the Dream Altar.\n\nOffered: {d}/3'
  },
  complete: {
    title: 'Field Notes',
    body: 'Pathway restored.\n\nSynapse Grove is now reachable.\nFurther regions coming soon.'
  }
};

// End-of-build completion text.
export const COMPLETION_TEXT = {
  title: 'Pathway Restored',
  body: 'The route to Synapse Grove is open.\nMore memories are waiting to grow.\n\nEnd of current build. Synapse Grove coming soon.'
};
