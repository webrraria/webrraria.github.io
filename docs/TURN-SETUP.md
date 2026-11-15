# Webrraria v0.17.3: Turnix setup

The game and backend now support Turnix TURN. These files are prepared and tested locally, not deployed to your account. Keep the Personal game private. The existing room-service address remains https://webrraria-room-gateway.pages.dev.

## Existing installation: fix TURN requests

Download Webrraria-TURN-Fix.zip, choose Extract All, then double-click deploy-turn-fix.cmd. This updates only the existing webrraria-rooms Worker, using its saved secret. The gateway does not need another deployment for this fix. After deployment, the gateway's /health includes `turnDiagnostics: 2`, which identifies the new code but does not prove successful credentials. Use the updated Personal/public game files for the Multiplayer UI cleanup.

The earlier backend used `redirect: "error"`. Cloudflare Workers does not implement that mode and throws before sending a request. It is now `redirect: "manual"`; all non-success statuses, including redirects, are rejected without following Location or sending the token to a new host. The original failure and the fix were reproduced in the actual local workerd/SQLite runtime. No production token was used by the assistant.

## Windows: full backend update

1. Download Webrraria-TURN-Update.zip and choose Extract All. Do not run the script inside the ZIP preview.
2. Open the extracted folder and double-click deploy-turn.cmd.
3. The script installs the pinned Wrangler tool, updates the existing webrraria-rooms Worker, then updates the existing webrraria-room-gateway Pages project. It uses your existing Cloudflare login. If login is required, complete the official browser login using the same account as before.
4. Do not enter the Turnix token in any file or command. The Worker reads the TURNIX_API_TOKEN secret you already saved in its dashboard. A normal Worker code deployment preserves secret bindings. This script does not change your billing plan or subscribe to Cloudflare TURN.
5. If any command fails, stop and send its error message, with credentials and login callback URLs hidden. Do not disable Windows security. If an account, project, or paid-plan prompt looks unexpected, stop rather than creating a replacement service.
6. After both deploy commands succeed, open https://webrraria-room-gateway.pages.dev/health. It should include `"turnProvider":"turnix"` and `"turnConfigured":true`, along with the existing service/protocol fields. Additional fields are normal. This confirms a secret is present, not that the provider accepted it.
7. If turnConfigured is false, check the encrypted secret on the **webrraria-rooms Worker**. Do not put it on the Pages gateway or in the game. Ensure its exact name is TURNIX_API_TOKEN and redeploy the secret. Do not send the value to anyone.

The script uses Node.js 22+ and npm.cmd, avoiding PowerShell's npm.ps1 wrapper. Node.js 24 is suitable. Wrangler is pinned to 4.156.2. The checked lockfile audited with zero vulnerabilities when prepared. The only allowed install-script entries are esbuild@0.28.2 and workerd@1.20261102.1. Do not use blanket install-script approval or audit fix --force.

## Update the game

- Download the updated Webrraria-Personal.zip for your private game. Export world backups before moving or replacing the HTML. Browser saves are tied to the browser and origin/path behavior, not contained in a ZIP.
- For your public game site, deploy the updated Webrraria-GitHub-Pages.zip instead. Never publish the Personal build.
- Both players should use the new files or hard-refresh the public site. The version remains v0.17.3, so an old cached v0.17.3 can otherwise look current.
- Your room-service URL stays the same. No new public key or TURN URL must be typed into the game.

## Test with your friend

Host Room and Join Room work as before. Manual Invite / Manual Answer also request relay credentials through the same room service. TURN availability is checked only when starting a connection, not by opening the Multiplayer panel.

The Multiplayer panel no longer displays relay checks, availability text or a direct/relay badge. The provider is selected automatically in the background; normal connection messages remain.

For an optional forced-relay test, open the updated game in two separate browser profiles or a normal/private window. In the host window, before starting a session, run this in Developer Tools' Console:

```js
window.RTCPeerConnection = class extends window.RTCPeerConnection {
  constructor(options) {
    super({ ...options, iceTransportPolicy: "relay" });
  }
};
```

Host a test world, then join from the other window with its room code. You do not need different networks or someone with restrictive NAT. A successful world transfer/chat connection with the host forced to relay verifies actual relay transport. A successful unforced connection or /health response alone does not. Reload the host page afterward to restore normal direct-preferred behavior. Testing consumes some of your provider allowance.

If troubleshooting is needed, select the actual POST ending in /ice inside Developer Tools -> Network -> Response, rather than opening its address as a new page (which sends GET and returns Method not allowed). A successful response is HTTP200 and contains temporary credentials; do not share it. On failure, share only the fixed error/code and optional upstreamStatus fields, not request authorization headers. Failed provider attempts also count toward the request guards, so avoid repeated attempts before understanding the error.

Do not expect TURN to fix every firewall or guarantee a specific latency. Actual Turnix credentials, geographic routing, and your friend's network must still be verified after deployment. There is no automatic ICE restart or host migration; create a fresh connection after a failed session or network change. Each new connection requests fresh credentials rather than reusing localStorage copies.

## Security, limits and privacy

- The permanent Turnix API token stays in the Worker environment. The browser receives only short-lived ICE credentials, kept in memory and omitted from world saves and game settings.
- A prepared invitation supplies an existing-style random host capability; a joining player gets a separate guest capability. TURN issuance requires one of those role tokens. Merely knowing the six-character code is not enough to read a host's credentials.
- Each role receives its own credential. Repeated requests for that same pending role reuse the result so concurrent calls do not mint duplicates. The room's temporary credentials are cleared on close/connected or expired with its storage record.
- The backend requests a 3,600-second TTL explicitly. Turnix's default is much shorter. Existing allocations are documented by Turnix to continue after credential expiry; a new connection or restart needs fresh credentials.
- Additional issuance guards allow 12 new credentials per public IP per hourly window and 100 globally per UTC-day bucket. Failed provider attempts also count. Existing general room request limits remain. TURN_DAILY_LIMIT may be set to an integer 1 through 1000 on the Worker if the owner deliberately needs a different global guard.
- These are request guards, not bandwidth caps. The game cannot enforce a provider spending cap. Invite creation is anonymous, not verified user login, so this is not complete abuse protection. Keep the Turnix project on its free plan, monitor its usage, and revoke/rotate the token in Turnix if needed. Its advertised free allowance when this update was prepared was 10 GB of relay traffic per month without a credit card; check the current dashboard rather than assuming unlimited traffic or a guaranteed hard stop. No paid upgrade is required by these files.
- The Worker sends the connecting public IP to Turnix for regional selection, plus anonymous room/role labels. Never send real player names or world content to the credential API.
- Gameplay and chat use an encrypted WebRTC data channel, direct or relayed. When relay is selected, Turnix forwards encrypted packets, including world transfer. The Cloudflare signaling Worker and gateway still do not receive those gameplay packets.
- Cross-origin access is required for the public game and local Personal HTML. CORS is not authentication or a billing safeguard.

## Testing performed

Worker and gateway unit tests cover token checks, two-phase preparation/publication, separate credentials, concurrent requests, secret isolation, response-size/URL/expiry validation, upstream failures, quota errors, issuance limits, and old room APIs.

Real browser tests used Personal and public builds with an actual local coturn relay forced through relay-only ICE. Room-code and manual connections transferred a world and chat; selected candidate statistics confirmed relay use. Provider credential minting was mocked for that test because no production token is available in this workspace. Direct fallback and old-backend compatibility were also tested. The Worker was exercised in the real local workerd/SQLite Durable Object runtime and the gateway compiled successfully.

These checks are not a live Turnix allocation test and not a production deployment. They do not certify that the token saved in your account is valid.

Provider references:
- https://turnix.io/docs/intro
- https://turnix.io/docs/api-reference/credentials
- https://turnix.io/docs/concepts/credentials
- https://developers.cloudflare.com/workers/configuration/secrets/
- https://developers.cloudflare.com/workers/runtime-apis/request/
