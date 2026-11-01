# Tony Tang — Neural Playground portfolio

A full Next.js portfolio with a Three.js project universe and five interactive engineering case studies. All demonstrations use synthetic data and scripted interactions; no API keys or live services are required.

## Run locally

Use Node.js 22 LTS and npm.

```sh
npm ci
npm run dev -- --port 3003
```

## Validate and build

```sh
npm run lint
npm run build
```

See BUILD-INSTRUCTIONS.md for standalone deployment and archive contents.

## Experiences

- **Kazilo AI:** capability discovery, generated draft, deliberate validation failure, feedback correction and inspectable workflow nodes. Two curated prompts illustrate Claude/GPT-assisted authoring; the portfolio does not call those APIs.
- **FlexVal:** move actions across a Map scope boundary and inspect the resulting simplified compilation fragment.
- **NexusMF:** compare approved vendor, current store and incoming supplier versions; preserve merchant enrichment during approval.
- **lamb:** select captured workflow inputs and demonstrate local replay with a breakpoint.
- **Notifications:** explore normal execution, completion-first delivery and silent-job detection.

Each case study includes architecture decisions, individual contribution, attribution and delivered/planned scope. Motion controls, system reduced-motion preferences, keyboard controls, mobile layouts, a list view and a WebGL fallback are included.

## Source map

- `app/page.tsx`: navigation, home, project index, introduction and contact.
- `components/universe/content.ts`: project copy and architecture decisions.
- `components/universe/UniverseScene.tsx`: procedural Three.js scene.
- `components/universe/KaziloAI.tsx`: scripted AI authoring demonstration.
- `components/universe/ProjectExperience.tsx`: case study views.
- `components/studio`: retained project simulations and source content.
- `app/universe.css` and `app/studio.css`: active styles.

Earlier standalone components and globals.css are retained as history but are not rendered. Fonts load from Google Fonts with system fallbacks. No generated video or external 3D assets are required.

## Living systems refinement — October 2026

The active design adds a procedural particle ribbon, sculpted Kazilo core, travelling connection signals and responsive visual refinements in `app/refinement.css`. Kazilo includes a keyboard-accessible three-platform showcase in `components/universe/KaziloPlatform.tsx`. Interfaces are illustrative, not product screenshots. Contribution copy reflects sole end-to-end engineering ownership.

Validated with a production build, desktop WebGL rendering, platform tab and keyboard switching, and 390px mobile overflow checks. No voice tour is included.

## Editorial + System Atlas hybrid

The active site uses `app/portfolio.css`, composed in order from universe.css, studio.css and editorial.css. The homepage uses ivory, condensed typography and static red connector artwork. `SystemMap.tsx` provides inspectable architecture diagrams; the five existing project demos remain available. Kazilo ownership reflects full end-to-end engineering responsibility. The Three.js universe is retained in source history and is no longer loaded by the homepage.
