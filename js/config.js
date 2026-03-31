// Public-only config for GitHub Pages (no secrets).
// You can commit this file safely as long as you only store public URLs/labels.
//
// Production: protect the Portal hostname with Cloudflare Access (edge), not JS-only hiding.
// See docs/PORTAL_CLOUDFLARE_ACCESS.md in the main repo.
globalThis.__APP_CONFIG__ = {
  // Worker API base URL (must be protected by Cloudflare Access).
  // Example: "https://9secvpn-api.nine-security.com"
  apiBaseUrl: "https://9secvpn-api.nine-security.com",

  // Optional. Leave empty: the portal will open a GET on the API host to complete Access (correct app binding).
  // Set only if you need a custom *.cloudflareaccess.com URL with redirect_url back to the portal.
  accessLoginUrl: "",

  // UI-only labels (no sensitive meaning).
  targetHostLabel: "Home Workstation",
  targetHostId: "home-ws-01",

  // Enable sending notify/login-success after session start.
  enableNotifications: true,

  // Official Cloudflare Tunnel client (cloudflared) — public URLs only.
  cloudflaredDocsUrl:
    "https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/",
  cloudflaredReleasesUrl: "https://github.com/cloudflare/cloudflared/releases",

  // Optional helper text for legacy client-proxy mode only.
  // Keep empty when using direct .rdp target to Cloudflare RDP hostname.
  accessRdpHostname: "",
  rdpClientProxyHost: "127.0.0.1",
  rdpClientProxyPort: "13389",
  cloudflaredRdpAuthDocUrl:
    "https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/use-cases/rdp/rdp-cloudflared-authentication/",
};

