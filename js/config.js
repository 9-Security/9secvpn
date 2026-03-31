// Public-only config for GitHub Pages (no secrets).
// You can commit this file safely as long as you only store public URLs/labels.
//
// Production: protect the Portal hostname with Cloudflare Access (edge), not JS-only hiding.
// See docs/PORTAL_CLOUDFLARE_ACCESS.md in the main repo.
globalThis.__APP_CONFIG__ = {
  // Worker API base URL (must be protected by Cloudflare Access).
  // Example: "https://9secvpn-api.nine-security.com"
  apiBaseUrl: "https://9secvpn-api.nine-security.com",

  // Cloudflare Access login URL for the API application (public URL).
  // Used when Connect/session API returns 401/403. Portal hostname should have its own Access app.
  accessLoginUrl: "https://9secvpn-api.nine-security.com/cdn-cgi/access/login",

  // UI-only labels (no sensitive meaning).
  targetHostLabel: "Home Workstation",
  targetHostId: "home-ws-01",

  // Enable sending notify/login-success after session start.
  enableNotifications: true,

  // Official Cloudflare Tunnel client (cloudflared) — public URLs only.
  cloudflaredDocsUrl:
    "https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/",
  cloudflaredReleasesUrl: "https://github.com/cloudflare/cloudflared/releases",

  // RDP 網域已套用 Access 時：用戶端需先跑 cloudflared access rdp，再開 .rdp（內容會連到下方 proxy 位址）。
  accessRdpHostname: "9sec-rdp.nine-security.com",
  rdpClientProxyHost: "127.0.0.1",
  rdpClientProxyPort: "13389",
  cloudflaredRdpAuthDocUrl:
    "https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/use-cases/rdp/rdp-cloudflared-authentication/",
};

