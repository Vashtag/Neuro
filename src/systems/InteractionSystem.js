import { GAME_CONFIG, PALETTE } from '../config.js';
import { INTERACTABLES } from '../data/mapData.js';
import { TEXTURE_KEYS } from '../data/assetManifest.js';

const T = GAME_CONFIG.tileSize;
const RANGE = T * 1.6; // proximity radius to a zone edge

// InteractionSystem: resolves the single contextual action for E/Space using a
// fixed priority order, draws the "Press E" prompt over the active target, and
// highlights the farm tile in front of the player.
//
// GameScene supplies `handlers`:
//   onNpc(zone), onArchive(zone), onSleep(zone), onSign(zone),
//   onFarm({x,y}), onUnavailable()
export default class InteractionSystem {
  constructor(scene, player, map, handlers) {
    this.scene = scene;
    this.player = player;
    this.map = map;
    this.handlers = handlers;

    // Pre-compute world geometry for each interactable zone.
    this.zones = INTERACTABLES.map((z) => ({
      ...z,
      left: z.x * T,
      top: z.y * T,
      right: (z.x + z.width) * T,
      bottom: (z.y + z.height) * T
    }));

    this.promptSprite = scene.add
      .image(0, 0, TEXTURE_KEYS.promptE)
      .setDepth(9000)
      .setVisible(false);

    this.highlight = scene.add.graphics().setDepth(5).setVisible(false);

    this.currentTarget = null; // { kind, zone?, tile? }
  }

  distanceToZone(zone) {
    const dx = Math.max(zone.left - this.player.x, 0, this.player.x - zone.right);
    const dy = Math.max(zone.top - this.player.y, 0, this.player.y - zone.bottom);
    return Math.hypot(dx, dy);
  }

  zoneInRange(zone) {
    return this.distanceToZone(zone) <= RANGE;
  }

  nearestOfType(types) {
    let best = null;
    let bestD = Infinity;
    for (const z of this.zones) {
      if (!types.includes(z.type)) continue;
      const d = this.distanceToZone(z);
      if (d <= RANGE && d < bestD) {
        bestD = d;
        best = z;
      }
    }
    return best;
  }

  // Determine the current contextual target following the priority order. Used
  // both for the prompt/highlight (each frame) and for resolving an E press.
  resolveTarget() {
    // 1. NPC
    const npc = this.nearestOfType(['npc']);
    if (npc) return { kind: 'npc', zone: npc };

    // 2. building/object interactions (archive, sleep, dream altar, cortex)
    const building = this.nearestOfType([
      'archive',
      'sleep',
      'dream_altar',
      'cortex_library',
      'knowledge_cache'
    ]);
    if (building) return { kind: building.type, zone: building };

    // 3. farming tile in front of the player
    const tile = this.player.getFacingTile(this.map);
    if (this.map.isFarmable(tile.x, tile.y)) {
      return { kind: 'farm', tile };
    }

    // 4. signs / future crop teases
    const sign = this.nearestOfType(['sign']);
    if (sign) return { kind: 'sign', zone: sign };

    return null;
  }

  update() {
    const target = this.resolveTarget();
    this.currentTarget = target;

    // Position the prompt above the active target.
    if (target) {
      let px;
      let py;
      if (target.kind === 'farm') {
        px = target.tile.x * T + T / 2;
        py = target.tile.y * T - 4;
      } else {
        const z = target.zone;
        px = (z.left + z.right) / 2;
        py = z.top - 6;
      }
      this.promptSprite.setPosition(px, py).setVisible(true);
    } else {
      this.promptSprite.setVisible(false);
    }

    // Highlight the facing farm tile whenever it is farmable.
    const tile = this.player.getFacingTile(this.map);
    if (this.map.isFarmable(tile.x, tile.y)) {
      this.highlight.clear();
      this.highlight.lineStyle(2, PALETTE.sparkle, 0.9);
      this.highlight.strokeRect(tile.x * T + 1, tile.y * T + 1, T - 2, T - 2);
      this.highlight.setVisible(true);
    } else {
      this.highlight.setVisible(false);
    }
  }

  // Called when E/Space is pressed.
  interact() {
    const target = this.resolveTarget();
    if (!target) {
      this.handlers.onUnavailable?.();
      return;
    }
    switch (target.kind) {
      case 'npc':
        this.handlers.onNpc?.(target.zone);
        break;
      case 'archive':
        this.handlers.onArchive?.(target.zone);
        break;
      case 'sleep':
        this.handlers.onSleep?.(target.zone);
        break;
      case 'dream_altar':
        this.handlers.onDreamAltar?.(target.zone);
        break;
      case 'cortex_library':
        this.handlers.onCortexLibrary?.(target.zone);
        break;
      case 'knowledge_cache':
        this.handlers.onKnowledgeCache?.(target.zone);
        break;
      case 'farm':
        this.handlers.onFarm?.(target.tile);
        break;
      case 'sign':
        this.handlers.onSign?.(target.zone);
        break;
      default:
        this.handlers.onUnavailable?.();
    }
  }

  setPromptVisible(visible) {
    if (!visible) this.promptSprite.setVisible(false);
  }
}
