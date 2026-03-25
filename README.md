# 9SecVPN Portal (GitHub Pages)

This folder is a static portal intended to be deployed on **GitHub Pages**.

## Configure (public values only)

Edit `pages/js/config.js`:

- `apiBaseUrl`: your Worker API domain (for example `https://9secvpn-api.nine-security.com`)
- `accessLoginUrl`: Cloudflare Access login URL for the API app (public URL)
- `targetHostLabel` / `targetHostId`: UI labels

Do **not** put any secrets in GitHub Pages.

## Deploy

Publish the contents of `pages/` via GitHub Pages.

