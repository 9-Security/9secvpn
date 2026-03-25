// Public-only config for GitHub Pages (no secrets).
// You can commit this file safely as long as you only store public URLs/labels.
globalThis.__APP_CONFIG__ = {
  // Worker API base URL (must be protected by Cloudflare Access).
  // Example: "https://9secvpn-api.nine-security.com"
  apiBaseUrl: "https://9secvpn-api.nine-security.com",

  // Cloudflare Access login URL for the API application (public URL).
  // If set, Portal will redirect here when API returns 401/403.
  accessLoginUrl: "",

  // UI-only labels (no sensitive meaning).
  targetHostLabel: "Home Workstation",
  targetHostId: "home-ws-01",

  // Enable sending notify/login-success after session start.
  enableNotifications: true,
};

