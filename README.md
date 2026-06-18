# Neurobloom

A top-down cozy pixel-art **neuroscience farming game** built with Phaser + Vite.

You play **The Little Neuroscientist**, a tiny researcher-gardener inside
**Hippocampus Hollow** — a magical brain-biome village where memories grow like
crops. The Memory Archive has gone dim and **Forgetting Fog** blocks the path
north. Grow and archive **5 Memory Berries** to restore the Archive, clear the
fog, and reach the Synapse Grove teaser path.

Learning is embedded in the mechanics, not quizzed:

| Action | Concept |
|---|---|
| Plant Memory Seed | Encoding |
| Water crop | Attention / rehearsal |
| Sleep | Consolidation |
| Harvest Memory Berry | Retrieval |
| Archive Memory Berry | Long-term storage |

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## Controls

| Key | Action |
|---|---|
| WASD / Arrow keys | Move |
| E / Space | Interact / contextual action |
| Esc | Decline a prompt (e.g. sleep) |
| M | Toggle sound |
| R | Reset save (development only) |

## Build & deploy

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

Deployment to GitHub Pages is automated via `.github/workflows/deploy.yml`,
which builds and publishes on every push to `main`. The Vite `base` is set to
`/neuro/` to match the repository name, so the live site is served at
`https://vashtag.github.io/neuro/`.

To enable it once: **Settings → Pages → Build and deployment → Source: GitHub
Actions**.

## Tech

- [Phaser 3](https://phaser.io/) — game framework
- [Vite](https://vitejs.dev/) — dev server & bundler
- Vanilla JavaScript, `localStorage` save, hard-coded tile map
- Placeholder art is generated programmatically at runtime; real pixel-art PNGs
  can be dropped into `public/assets/` and wired through the asset manifest
  without changing game logic.

## Status

**MVP complete and playable end-to-end.** The full loop works: talk to Dr. Hebb →
receive tools + 5 Memory Seeds → till/plant/water → sleep to consolidate (twice) →
harvest Memory Berries → deposit them at the Memory Archive → Archive reaches 5/5
→ Forgetting Fog clears → walk north into the Synapse Grove teaser path → see the
completion message. Progress autosaves on sleep and restores on reload.

All art is generated programmatically and all SFX are synthesized at runtime, so
the game runs with no external asset files. See commit history for milestone-by-
milestone progression.
