# v0.17.4: Feels Like Home

Back up your worlds before updating. Keep the Personal ZIP private. Both multiplayer players need v0.17.4 and matching enabled mod ZIPs. The game version is 0.17.4, the room protocol stays 2, and the game-content handshake is now 19.

## Make yourself at home

Eight items and fourteen recipes have been added, for 39 recipes total.

- Work Bench: 10 Wood. Place it on a supported floor.
- Furnace: 20 Stone, 4 Wood, 3 Torches, near a Work Bench.
- Iron Bar: 3 Iron Ore, near a Furnace.
- Copper Bar: 3 Copper Ore, near a Furnace.
- Iron Anvil: 5 Iron Bars, near a Work Bench.
- Wooden Chair: 4 Wood, near a Work Bench.
- Wooden Table: 8 Wood, near a Work Bench.
- Iron Axe: 6 Iron Bars and 3 Wood, near an Iron Anvil.

Stand within six tiles of a placed station. Holding it in your inventory does not count. Recipes show the station they need. The earlier hand recipes remain, so existing worlds can still craft what they could before.

Work Benches also make four Bricks from two Stone, or four Platforms from one Wood. Furnaces make four Glass from two Sand. Anvils can forge an Iron Broadsword or Pickaxe from bars, or make twelve Torches from a Copper Bar, Wood, and Gel.

Furniture reserves its full footprint. Click any part to mine it; it drops one furniture item. It does not block walking, and chairs/tables are decorative rather than sitting or housing systems. Line/box building is for blocks, not furniture. Furniture and stations save with the world and sync in multiplayer.

## Better finds

Supply caches have larger stacks of torches, gel, iron, amber, and healing items, plus a varied extra find. Deeper caches can contain tools and stronger healing supplies. Treasure-room chests in new worlds include more supplies, a Work Bench, and a varied bonus.

Already saved chest contents are not replaced. Old worlds are not regenerated. Previously unused caches without saved contents use the new loot when first opened or mined. Finds are saved, not rerolled every time you open a container.

## Other changes

- Tree trunk bases now extend into the grass fringe instead of ending above it.
- The Brick icon uses the brick sprite, not the Lens sprite. New furniture uses the corresponding original item and tile-sheet frames in the Personal build.
- Click and drag the sun on the title screen. This does not move the in-world sun or change world time. It is disabled in an active world's pause menu.
- Optional accounts, account recovery codes, and signed-in guest characters saved separately for each host world. The account screen includes an arrow-based Head/Hair/Body/Legs editor with a turning/walking preview, plus pixel editing and PNG uploads under Advanced. Read ACCOUNTS.md.

## Updating

Extract the new game ZIP. Export old worlds first if changing the file location, browser, or site. Import those backups in the new build. Do not open an updated world in an older build.

Accounts require the updated Worker and Pages gateway. The separate Webrraria-Accounts-Update.zip has the existing-project Windows update script. No deployment was performed while preparing these files. The game still works signed out if accounts are unavailable. The existing Turnix setup is preserved and runs in the background, without relay-status controls.

## Owner admin follow-up

Added the verified owner Admin badge and panel, host-only item grants and safe teleport, and server-authorized account ban/unban/skin reset. The deployment pins the existing cokindacola account ID once. Update both the existing Worker/gateway and the game HTML, preserving account storage. No new version or migration. Account bans do not block signed-out guests. See ACCOUNTS.md.

## Crafting station interaction fix

Right-click a placed Work Bench, Furnace, or Iron Anvil to open its crafting recipes. Click any part of the station, not just its anchor tile. Work Bench makes furniture and building supplies; Furnace smelts ore into bars and sand into glass; Iron Anvil uses bars for tools, weapons, and supplies. The crafting panel shows nearby stations and an All Recipes button. Inventory crafting still works while nearby. Walking out of reach or losing the station disables its recipes. Stations must be placed, not merely held. Wooden Table and Wooden Chair remain placeable furniture, not replacement crafting stations.

This fix needs only the updated game HTML. It does not require another backend deployment and preserves existing admin/account features and world saves. Export a world backup before replacing or moving the HTML.
