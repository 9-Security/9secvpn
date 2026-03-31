# 9SecVPN Portal (GitHub Pages)

Single static page: `index.html` (connect + recent activity).

## Security (production)

靜態檔本身無法「先驗證再送 HTML」。**最高安全性**作法是對 **Portal 的自訂網域**在 Cloudflare 上啟用 **Proxy + Access**，詳見專案內 [`docs/PORTAL_CLOUDFLARE_ACCESS.md`](../docs/PORTAL_CLOUDFLARE_ACCESS.md)。

## Configure (public values only)

Edit `js/config.js`:

- `apiBaseUrl`
- `accessLoginUrl`
- `targetHostLabel` / `targetHostId`
- `cloudflaredDocsUrl` / `cloudflaredReleasesUrl` (official download links)

Do **not** put any secrets in GitHub Pages.

## Deploy

Publish the contents of this folder via GitHub Pages (`/` root).
