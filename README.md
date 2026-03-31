# 9SecVPN Portal (GitHub Pages)

Single static page: `index.html` (connect + recent activity).

## Security (production)

靜態檔本身無法「先驗證再送 HTML」。**最高安全性**作法是對 **Portal 的自訂網域**在 Cloudflare 上啟用 **Proxy + Access**，詳見專案內 [`docs/PORTAL_CLOUDFLARE_ACCESS.md`](../docs/PORTAL_CLOUDFLARE_ACCESS.md)。

## Configure (public values only)

Edit `js/config.js`:

- `apiBaseUrl` — Worker API 根網址（須有獨立 Access 應用時與 Portal 不同主機名）。
- `accessLoginUrl` — **可選，預設留空。** 留空時，若需補 API 的 Access Cookie，前端會整頁開 `GET {apiBaseUrl}/api/history?limit=1`。進階情境才設定自訂 `*.cloudflareaccess.com/.../login/...`（須與 Zero Trust 應用網域一致）。勿使用 `https://<api>/cdn-cgi/access/login` 作為預設。
- `accessRdpHostname` / `rdpClientProxyHost` / `rdpClientProxyPort` — RDP 受 Access 保護時，與本機 `cloudflared access rdp --url` 一致。
- `targetHostLabel` / `targetHostId`
- `cloudflaredDocsUrl` / `cloudflaredReleasesUrl`（官方下載連結）

Do **not** put any secrets in GitHub Pages.

行為細節與驗收看 [`docs/PORTAL_CLOUDFLARE_ACCESS.md`](../docs/PORTAL_CLOUDFLARE_ACCESS.md) 第 4 節。

## Deploy

Publish the contents of this folder via GitHub Pages (`/` root).
