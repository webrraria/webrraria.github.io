# Optional accounts

You do not need an account to play. Open Account on the title screen or pause menu to sign in, create an account, recover it, or edit your skin. Availability depends on the separately deployed account service.

## Username, password, and recovery

Choose a permanent username with 3 to 20 letters, numbers, or underscores. Names are case-insensitive for sign-in and registration. There is no email address or password-reset email.

Keep the recovery code shown when you create the account somewhere private. It is shown once. Losing both the password and recovery code means there is no recovery method. Recovery keeps your account ID and username, changes the password, invalidates previous sessions, and gives you a new single-use recovery code. Keep the replacement code. Do not send passwords, sessions, or recovery codes to another player or post them in chat.

Remember me is off by default. When checked, the opaque session token is kept in this browser's local storage; otherwise it uses session storage. Sessions expire after 30 days. Sign out on shared computers. Password changes and recovery invalidate old sessions. Do not reuse an important password from another service.

## Character editor

Choose **Account > Edit Character**. Use the left/right arrows for Head, Hair, Body, and Legs. Each part has three existing preset variants that can be mixed independently. The live preview can face either direction and show idle or walking poses. **Save Character** applies your choices; **Reset Changes** returns the controls to the selection you opened or last saved. Leaving without saving does not apply the draft.

Preset selections are saved to your account as four part numbers. The game composes the matching preset textures locally; the account service does not receive or redistribute the Personal build's native pixels. A public build needs a compatible character resource pack to display the preset preview. Without those textures, it shows a resource-pack notice instead of inventing replacement artwork. Other players see the saved selection after reconnecting, using their own available textures.

Open **Advanced: pixel editor and PNG upload** for custom artwork. Saving a PNG replaces the preset selection; saving a preset replaces the PNG. The Advanced canvas does not copy private preset artwork into an uploadable sheet. **Use Default Character** clears both the saved preset and custom PNG.

The included account backend must be updated to support preset descriptors, even if you already deployed an earlier v0.17.4 account service. Use the updated Accounts Update ZIP. World saves, account IDs, passwords, recovery codes, and sessions are unchanged by this UI update. There is no new game version or database migration.

## Skins

Draw a frame, choose colors/brush size, and use Copy Frame to All if you want the same picture for every animation frame. Save Skin uploads your custom skin. You can also download the blank template, edit it, then upload and save it.

The PNG must be 40 pixels wide by 1120 pixels high: 20 stacked frames, each 40 by 56 pixels. Keep transparency where you want the background to show. Maximum file size is 64 KB. Animated PNGs are not supported. Uploading loads the editor; Save Skin publishes the change. The native default character is not uploaded as a template.

Usernames and saved skins are public profile information. Do not put private information or artwork you lack permission to share in a skin. The skin service removes unrelated PNG metadata. Using the editor is optional; the default character remains available.

## Multiplayer progress

A signed-in guest's character belongs to that account ID in that particular host world, not to a typed display name. The host verifies a short-lived, connection-bound account proof before sending a saved character. Passwords and account sessions are not sent to peers. The host's own character remains in that host world's existing player save.

The host saves signed-in guest inventories, held items, selected slots, health, and position inside the host world. Leave Session or Save & Exit normally so the guest can wait briefly for a host save confirmation. Abrupt disconnection, a crash, full storage, or closing a tab can lose recent changes. Keep both tabs open while playing. Signed-out guests still have session-only characters.

Another host world starts a separate character. The host must retain the same world save. Signing in on a different computer does not download worlds or items from a cloud backup. Export/import of a host world includes its saved guest characters, usernames, and account IDs, but not account passwords, sessions, recovery codes, or skins. Only the joining guest's own character is sent over multiplayer; other saved guest characters are excluded.

A world holds at most 64 signed-in guest profiles. This is a cooperative game, not an anti-cheat inventory service. The world owner and modified clients can alter saves or report altered state. Account identity verification does not make game items cheat-proof.

## Service information

The game uses its fixed account authority at https://webrraria-room-gateway.pages.dev/accounts/. Overriding the room-service address does not redirect account passwords or sessions. Requests use HTTPS in production. The service sees account requests and an IP address for rate limiting; stored rate keys use IP hashes. It stores username/account ID, salted password-derived hashes, hashed recovery/session tokens, session expiry, and optional public skin data. It does not store host worlds.

Password derivation is PBKDF2-SHA256 with 600,000 client iterations, followed by a separate server-salted 10,000-iteration hash. The client-derived value is password-equivalent: protect the service, browser, network connection, and deployment account. Recovery codes and session tokens are random and stored hashed on the server. Peers receive signed, short-lived audience-bound proofs, not your account login credentials.

Default registration limits include 250 accounts total, 3 registrations per IP per hour, and 25 globally per day, plus login/request limits. These protect a small beta service; they are not billing or usage guarantees. Existing stored accounts and signing keys live in the AccountStore Durable Object. Do not delete its storage or reset its migration to fix a deployment error.

## Owner admin (v0.17.4 follow-up)

The included Worker configuration sets `ADMIN_BOOTSTRAP_USERNAME` to `cokindacola`. On its first account request after this upgrade, the backend looks up that name case-insensitively in the EXISTING account database and saves its immutable account ID as the owner. It does not create the account or accept a role from the browser. If the account is missing, the one-time check records that result and stops: registering that name afterward does not grant admin. Once an owner ID is stored, changing a typed/display username or bootstrap setting cannot transfer it. The existing account was not modified on the live service while preparing these files.

Deploy this update to the same `webrraria-rooms` Worker and the same account Durable Object binding/storage. Keep the existing account database, signing key, migrations and Worker name. Do not delete storage, recreate your account, reset migrations or create a replacement service. This follow-up adds no migration beyond the existing v2. Redeploy the gateway too, because its exact route allowlist now forwards only `/accounts/admin/accounts` and `/accounts/admin/action`. No new subscription, payment setup or TURN token entry is needed.

After both deployments succeed, open `/accounts/health`. `adminEnabled: true` means an existing account ID was pinned, not that your browser session was authenticated. If it is false, stop and report the result without sharing credentials; do not register a replacement account to try to gain the role. Replace the game HTML with this build, then sign out and back in to the existing cokindacola account. Account shows an Admin badge and Admin Panel; a loaded world's pause menu shows Admin Tools. Signed-in profiles refresh roughly once a minute in a visible tab. An older HTML file will not have the panel.

Game tools require a fresh server-signed admin proof for every action. Give to Me respects item stack limits and refuses a full inventory without partial grants. Teleport Me uses whole tile coordinates and refuses solid/occupied/out-of-bounds destinations. Go to Spawn searches nearby clear space. These tools affect only the admin's own character in a single-player world or the world they host. They are disabled when joining another host, including an ordinary player's world. No game-admin command is accepted from the guest over WebRTC. The host's local browser still owns and saves the world; this is not a tamper-proof anti-cheat system or a cloud world service.

Moderation supports a paginated account list, exact case-insensitive username search, Ban, Unban, and Reset Skin. All actions require a valid admin session on the backend. The owner account is protected from these moderation actions. Lists contain account ID, username, verified role, ban status and skin-presence/hash only, never passwords, session tokens or recovery codes. A private bounded backend audit keeps the last 200 successful moderation actions; it stores actor ID, target ID, action, optional bounded reason and time, not credentials. Moderation is limited to 60 requests per admin per minute in addition to existing API limits.

Ban revokes all existing sessions and blocks login, recovery, identity tickets and public authenticated-account profiles. Unban does not restore the old sessions; the player must sign in again. Reset Skin clears both uploaded PNGs and preset selections, not the password, inventory or recovery code. Updated clients check their own sessions and connected account profiles roughly every minute while running, so an already connected banned account is removed at the next successful check. Existing short-lived proofs are also checked against the current backend profile when joining. Skin resets are picked up at these checks or on reconnect. This is not an instantaneous push notification; old/modified clients and offline checks cannot be guaranteed. Accounts remain optional, so an account ban does NOT block playing signed out or joining as an unauthenticated guest. It is not an IP/device ban.
