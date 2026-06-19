import { GEN_KEYS } from '../systems/TextureFactory.js';
import { TEXTURE_KEYS } from './assetManifest.js';

// Field Guide entries. Each fills in as the player encounters the matching
// concept in-world. `discovered(state)` reads existing progress flags so the
// guide needs no bespoke tracking. The body text is the educational payoff.
export const CODEX_ENTRIES = [
  {
    id: 'memory_berry',
    title: 'Memory Berry',
    concept: 'Episodic Memory',
    icon: GEN_KEYS.iconBerry,
    body:
      'Episodic memories record personal experiences — what happened, where, and when. ' +
      'You encode them by paying attention, and they grow stronger each time you revisit them.',
    discovered: (s) => s.tutorial.harvestedFirstBerry
  },
  {
    id: 'dream_bloom',
    title: 'Dream Bloom',
    concept: 'Sleep & Consolidation',
    icon: GEN_KEYS.iconDreamBloom,
    body:
      'During sleep the brain replays the day and moves fragile new memories into stable ' +
      'long-term storage. Several nights of rest make a memory far harder to forget.',
    discovered: (s) => s.tutorial.harvestedFirstDream
  },
  {
    id: 'memory_archive',
    title: 'Memory Archive',
    concept: 'Retrieval & Storage',
    icon: GEN_KEYS.iconSatchel,
    body:
      'Recalling a memory and filing it away strengthens it — an effect called retrieval ' +
      'practice. Long-term memory has effectively unlimited room.',
    discovered: (s) => s.tutorial.depositedFirstBerry
  },
  {
    id: 'dr_hebb',
    title: 'Dr. Hebb',
    concept: 'Hebbian Learning',
    icon: 'hebb_down',
    body:
      '“Neurons that fire together, wire together.” When two neurons activate at the same ' +
      'time, the connection between them strengthens. This is how learning is wired in.',
    discovered: (s) => s.tutorial.metDrHebb
  },
  {
    id: 'forgetting_fog',
    title: 'Forgetting Fog',
    concept: 'Forgetting & Interference',
    icon: TEXTURE_KEYS.fog,
    body:
      'Memories that are never revisited or consolidated fade over time. Clearing the fog ' +
      'is attention and rehearsal recovering what was slipping away.',
    discovered: (s) => s.archive.fogCleared
  },
  {
    id: 'synapse_grove',
    title: 'Synapse Grove',
    concept: 'Synapses & Connection',
    icon: TEXTURE_KEYS.neuronTree,
    body:
      'Synapses are the tiny gaps where neurons pass signals. Stronger, busier synapses are ' +
      'the physical basis of a well-learned memory.',
    discovered: (s) => s.tutorial.reachedTeaserPath
  },
  {
    id: 'knowledge_herb',
    title: 'Knowledge Herb',
    concept: 'Semantic Memory',
    icon: GEN_KEYS.iconKnowledgeHerb,
    body:
      'Semantic memory holds facts and concepts, separate from when you learned them. It ' +
      'stays strong through spaced repetition — review regularly, or it fades.',
    discovered: (s) => s.tutorial.harvestedFirstKnowledge
  },
  {
    id: 'cortex',
    title: 'The Cortex',
    concept: 'Long-term Knowledge',
    icon: TEXTURE_KEYS.cortexColumn,
    body:
      'The cortex stores well-learned knowledge for the long term, organised in repeating ' +
      'columns of neurons. The hippocampus trains it through repeated replay.',
    discovered: (s) => s.tutorial.reachedCortex
  }
];

export function codexProgress(state) {
  const total = CODEX_ENTRIES.length;
  const found = CODEX_ENTRIES.filter((e) => e.discovered(state)).length;
  return { found, total };
}
