# Webrraria Mods · API 1 · v0.17.2

## Install a mod

1. Back up your worlds with **Single Player → Export**.
2. Save & Exit any open world.
3. Open **Mods → Import Mod ZIP**. Choose a Webrraria ZIP, not a Terraria `.tmod` file or a resource-pack folder.
4. A single ZIP can contain content definitions, textures, and JavaScript together. **Scripts run by default in single-player; importing does not show a confirmation popup by default. Only import mods you trust.**
5. If you want the **“Allow its scripts?”** prompt, opt into **Show “Allow its scripts?” confirmations** in Mods. This optional checkbox is **off by default**. With it on, undecided mods are blocked until you allow them; importing an undecided script mod shows the prompt. Cancel keeps its content but records Block for its scripts.
6. Each mod has its own **Allow scripts… / Block scripts** button. Explicit choices override the default and are remembered across reloads, along with the confirmation setting. Create or open a world when ready.

Packs stay in this browser's IndexedDB when storage is available. Keep the original ZIPs with your world backups. A saved world records each enabled pack's ID, version, and SHA-256 content fingerprint. Missing or changed packs block loading/importing; the game does not replace unknown blocks with dirt. Extra enabled packs become requirements the next time you save a world.

To update a pack, keep its old ZIP, uninstall it outside a world, then import the replacement. A world saved against the old fingerprint still needs the old pack. There is no automatic mod migration or dependency download. Disabling or uninstalling a mod does not delete its worlds.

**Multiplayer:** both players need Webrraria v0.17.0 and exactly the same enabled packs. Personal/public builds can connect with matching packs. No packs or scripts are downloaded from the host. Block scripts for every enabled mod before hosting or joining. Content can stay enabled. The room service does not need updating.

## Mod ZIPs

No example mod is bundled. A mod can contain content definitions and optional JavaScript in one ZIP. The creation guide below remains available. Keep original mod ZIPs if existing saved worlds require them; removing a bundled download does not uninstall browser-stored mods or change saved requirements.

## Make a mod ZIP

Use ordinary ZIP compression (stored or deflate). Put `mod.json` at the ZIP root, not inside another folder. No library, CDN, or build step is required. Pack IDs and local content IDs use lowercase letters, digits, `.`, `_`, and `-`, starting with a letter. The game namespaces item IDs as `pack-id:local-id`.

```json
{
  "format": "WebrrariaMod",
  "apiVersion": 1,
  "id": "my-building-pack",
  "version": "1.0.0",
  "name": "My Building Pack",
  "description": "An extra building block with optional code.",
  "script": "main.js",
  "blocks": [
    {
      "id": "slate",
      "name": "Slate Block",
      "tileId": 66,
      "base": "stone",
      "breakTime": 28,
      "solid": true,
      "texture": "textures/slate.png"
    }
  ],
  "items": [
    {"id": "slate-pick", "name": "Slate Pickaxe", "sprite": "pickaxe", "tool": "pickaxe", "power": 1.4}
  ],
  "recipes": [
    {"id": "slate", "out": "slate", "count": 4, "need": {"stone": 2}},
    {"id": "pick", "out": "slate-pick", "count": 1, "need": {"slate": 8, "wood": 3}}
  ],
  "worldgen": [
    {"block": "slate", "attempts": 30, "minDepth": 20, "maxDepth": 75}
  ]
}
```

- `blocks`: up to 16 per pack. Choose stable, explicit **tile IDs 64–239**; don't change them after people save worlds. Enabled packs cannot share a tile ID. `base` must name a built-in static block, e.g. `stone`, `dirt`, `brick`, `glass`, `wood`, `stoneslab`, `sandstonebrick`, `snowbrick`, `marble`, or `granite`. It supplies a picture if `texture` is omitted. `breakTime` is 1–120, default 28. `solid` defaults to true. Custom blocks drop their own item when mined.
- `texture`: optional local **static PNG**, at most 512 × 512 and 1 MB. A single **16 × 16 tile** is simplest; large images follow the game's existing 18-pixel-spaced tile-sheet frame selection. Block pictures also serve as item icons. Make your own artwork; don't redistribute somebody else's game files.
- `items`: up to 24. `sprite` is a built-in item ID; an optional `texture` replaces its picture. Optional `tool` is `pickaxe`, `axe`, or `sword`. Pickaxe/axe `power` is 0.1–3; sword `damage` is 1–20. Optional `heal` is 1–6 health points. Tools/healing use the existing game systems; this API does not add new UI panels or enemy types.
- `recipes`: up to 32. `out` and `need` keys refer to built-in items or **unqualified local IDs from this pack**, not another pack. Each recipe needs 1–8 ingredients, 1–999 of each; output count is 1–99. Repeated recipe IDs are rejected.
- `worldgen`: up to 8 rules; each replaces a few underground Stone cells with one of this pack's blocks. `attempts` is 1–100; `minDepth` is 12–120, `maxDepth` is between minDepth and 150, both measured below the surface. This affects **new worlds only**, is deterministic for a seed/pack, and is not a general world-generation scripting API.
- Pack limits: **8 MB ZIP**, 100 entries, 2 MB per expanded entry, 8 MB total expanded. Encrypted/split ZIPs, unsafe paths, checksum errors, animated PNGs, and oversized definitions are rejected. Native ZIP decompression requires a current browser; stored ZIPs work without it. SHA-256 needs a secure context such as HTTPS, localhost, or a local HTML file.
- Profile limits: 16 installed packs, 8 enabled packs, 64 custom blocks and 96 custom standalone items. On a saved-profile conflict, packs are disabled and the log explains why. Worlds remain untouched until their requirements are restored.

JSON content definitions do not execute JavaScript. A filename in a recipe or block name is just text. PNGs are decoded as images. Cross-pack references, world migration, arbitrary assets/HTML, arbitrary generation code, and native Terraria/tModLoader formats are not supported.

## Scripts: permission for each mod

Put `"script": "main.js"` in the same `mod.json` that defines your items, blocks, and recipes, and include `main.js` in **that same ZIP** (maximum 64 KB). No second pack or special “JavaScript mod mode” is needed. Content-only ZIPs remain supported when no code is needed.

**Scripts are allowed by default. The confirmation popup - not JavaScript execution - is opt-in.** With the confirmation checkbox off, new mods run their scripts in single-player without a popup unless you explicitly blocked them. With it on, new/undecided mods need approval; a prompt asks **“[Mod name] contains JavaScript. Allow its scripts?”** on import or re-enable. Existing saved Allow / Block choices are not reset when you toggle this setting.

**Allow scripts… / Block scripts** applies to one exact mod only. When confirmations are off, Allow applies immediately; when they are on, it shows the popup. Cancel records Block while leaving the content enabled. A saved Block stays blocked even when confirmations are off. Blocking a mod does not change its content fingerprint or another mod's choice.

The confirmation preference and explicit Allow / Block decisions are saved in this browser's separate mod database. **They do not reset on reload.** Decisions are tied to the mod's ID and exact fingerprint, never read from the mod manifest, a world file, or a multiplayer message. Disabling a mod stops its code but keeps the saved decision; uninstalling removes the decision. A changed/replacement ZIP does not inherit it: it follows the current default (automatic when confirmations are off, or needs new approval when on).

Save & Exit before changing mods, script decisions, or the confirmation preference. Up to four enabled script mods run at once, in mod-ID order; the log reports additional ones. Disable unwanted mods to choose which run. Workers terminate on Save & Exit and restart on the next single-player world according to the remembered settings. If browser storage is unavailable/full, the log and status explain that the choice is only remembered for this page session.

The checkbox only controls whether a confirmation is shown; it does not unlock extra APIs or certify code as safe.

**Allowing scripts does not mean the game has reviewed or approved the code.** A worker keeps it off the game thread and away from direct page DOM/localStorage access, but it is **not a security guarantee**. Code can use CPU, allocate memory, make network requests, and change inventory/terrain. Only allow files you trust and back up your worlds. Multiplayer is blocked while any enabled mod has script permission. Click **Block scripts** on those mods before joining; the content remains enabled. This is not an anti-cheat system.

Each worker gets an `api` object:

```js
api.on('start', state => {
  api.message('My helper is running.');
});

api.on('tick', state => {
  // Snapshot at most five times per second, only during active gameplay.
  // state.player: x, y (pixels), tileX, tileY, health
  // state.inventory: counts by item ID, including favorited stacks
  // state.nearby: {left, top, tiles} - a 17 × 13 tile window
  // state.time, state.day, state.biome
});

api.message('A short on-screen message');
api.giveItem('stone', 5);                  // Known item, integer 1–64
api.placeBlock('torch', 100, 70);          // Existing non-favorited stock only
```

Commands are validated on the main thread. Placement obeys emptiness, reach, support, container exclusion, player overlap, and stock checks. Scripts cannot batch-place containers, and no commands apply while paused, in inventory, or in multiplayer. Namespaced custom item IDs work in commands. Invalid commands are ignored; commands are limited to 10 per second per worker, message floods are terminated, and unresponsive workers are stopped after roughly three seconds. Handler errors appear in the mod log. There is no main-thread `eval` or automatic script execution from a save, room, or imported content pack.

If browser storage is blocked or full, the manager logs that imports/settings are session-only. The ZIP still works for that session; keep it for next time. Worlds and mod ZIPs must be exported/copied separately when moving to another browser or origin.
