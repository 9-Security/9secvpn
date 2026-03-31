(function () {
  const DEFAULT_CONFIG = {
    apiBaseUrl: "",
    accessLoginUrl: "",
    targetHostLabel: "Home Workstation",
    targetHostId: "home-ws-01",
    historyLimit: 10,
    enableNotifications: true,

    // Local/dev fallback (only used when Cloudflare Access headers are not present).
    mockUserEmail: "",
    mockSourceIp: "",
    cloudflaredDocsUrl:
      "https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/",
    cloudflaredReleasesUrl: "https://github.com/cloudflare/cloudflared/releases",

    accessRdpHostname: "",
    rdpClientProxyHost: "127.0.0.1",
    rdpClientProxyPort: "13389",
    cloudflaredRdpAuthDocUrl:
      "https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/use-cases/rdp/rdp-cloudflared-authentication/",
  };

  const query = new URLSearchParams(window.location.search);
  const APP_CONFIG = Object.freeze({
    ...DEFAULT_CONFIG,
    ...(globalThis.__APP_CONFIG__ || {}),
    /* `??` treats "" as set; empty query must not wipe config.js */
    apiBaseUrl: pickQueryString(query, "apiBaseUrl", globalThis.__APP_CONFIG__?.apiBaseUrl || DEFAULT_CONFIG.apiBaseUrl),
    accessLoginUrl: pickQueryString(
      query,
      "accessLoginUrl",
      globalThis.__APP_CONFIG__?.accessLoginUrl || DEFAULT_CONFIG.accessLoginUrl,
    ),
    mockUserEmail:
      query.get("mockUserEmail") ?? (globalThis.__APP_CONFIG__?.mockUserEmail || DEFAULT_CONFIG.mockUserEmail),
    mockSourceIp:
      query.get("mockSourceIp") ?? (globalThis.__APP_CONFIG__?.mockSourceIp || DEFAULT_CONFIG.mockSourceIp),
    targetHostId:
      query.get("targetHostId") ?? (globalThis.__APP_CONFIG__?.targetHostId || DEFAULT_CONFIG.targetHostId),
    cloudflaredDocsUrl:
      query.get("cloudflaredDocsUrl") ??
      (globalThis.__APP_CONFIG__?.cloudflaredDocsUrl || DEFAULT_CONFIG.cloudflaredDocsUrl),
    cloudflaredReleasesUrl:
      query.get("cloudflaredReleasesUrl") ??
      (globalThis.__APP_CONFIG__?.cloudflaredReleasesUrl || DEFAULT_CONFIG.cloudflaredReleasesUrl),
  });

  document.addEventListener("DOMContentLoaded", () => {
    hydrateHostLabels();
    hydrateCloudflaredLinks();
    hydrateRdpClientHint();
    wireConnectLinks();
    void hydrateHistoryLists();
  });

  function pickQueryString(params, key, fallback) {
    const raw = params.get(key);
    const trimmed = String(raw ?? "").trim();
    if (trimmed) return trimmed;
    return String(fallback || "").trim();
  }

  /** After API Access login, send user back to Portal (Cloudflare accepts redirect_url on login URLs). */
  function buildLoginUrlWithReturn() {
    const loginBase = normalizeUrl(APP_CONFIG.accessLoginUrl);
    if (!loginBase) return "";
    const back = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    const sep = loginBase.includes("?") ? "&" : "?";
    return `${loginBase}${sep}redirect_url=${encodeURIComponent(back)}`;
  }

  /**
   * Cloudflare Access returns 302 to *.cloudflareaccess.com; fetch “follow” crosses origins → CORS error.
   * Use redirect: manual + full-page navigation to complete login, then return to Portal via redirect_url.
   */
  function assignIfAccessRedirect(response, apiBaseUrl) {
    const loginGo = buildLoginUrlWithReturn();
    const st = response.status;

    if (st >= 300 && st < 400) {
      const loc = response.headers.get("Location");
      if (loc) {
        window.location.assign(new URL(loc, apiBaseUrl).href);
        return true;
      }
      if (loginGo) {
        window.location.assign(loginGo);
        return true;
      }
    }

    if (st === 401 || st === 403) {
      if (loginGo) {
        window.location.assign(loginGo);
        return true;
      }
      return false;
    }

    if (response.type === "opaqueredirect" || (st === 0 && response.type === "opaque")) {
      if (loginGo) {
        window.location.assign(loginGo);
        return true;
      }
      return false;
    }

    return false;
  }

  /**
   * @returns {Promise<Response | null>} null = browser is navigating to Access / login
   */
  async function fetchApi(apiBaseUrl, pathAndQuery, init = {}) {
    const base = normalizeUrl(apiBaseUrl);
    const url = pathAndQuery.startsWith("http") ? pathAndQuery : `${base}${pathAndQuery.startsWith("/") ? "" : "/"}${pathAndQuery}`;
    const loginGo = buildLoginUrlWithReturn();

    try {
      const response = await fetch(url, {
        credentials: "include",
        redirect: "manual",
        ...init,
      });

      if (assignIfAccessRedirect(response, base)) {
        return null;
      }

      return response;
    } catch (err) {
      if (loginGo && err instanceof TypeError) {
        window.location.assign(loginGo);
        return null;
      }
      throw err;
    }
  }

  function hydrateHostLabels() {
    document.querySelectorAll("[data-target-host]").forEach((element) => {
      element.textContent = APP_CONFIG.targetHostLabel;
    });
  }

  function hydrateCloudflaredLinks() {
    const docs = normalizeUrl(APP_CONFIG.cloudflaredDocsUrl);
    const releases = normalizeUrl(APP_CONFIG.cloudflaredReleasesUrl);
    document.querySelectorAll("[data-cloudflared-docs]").forEach((el) => {
      if (el instanceof HTMLAnchorElement && docs) el.href = docs;
    });
    document.querySelectorAll("[data-cloudflared-releases]").forEach((el) => {
      if (el instanceof HTMLAnchorElement && releases) el.href = releases;
    });
  }

  function hydrateRdpClientHint() {
    const wrap = document.querySelector("[data-rdp-client-hint]");
    const pre = document.querySelector("[data-rdp-cmd-block]");
    const docLink = document.querySelector("[data-cloudflared-rdp-doc]");
    if (!wrap || !pre) return;

    const host = String(APP_CONFIG.accessRdpHostname || "").trim();
    const proxyHost = String(APP_CONFIG.rdpClientProxyHost || "127.0.0.1").trim();
    const proxyPort = String(APP_CONFIG.rdpClientProxyPort || "13389").trim();

    if (!host) {
      wrap.setAttribute("hidden", "");
      return;
    }

    pre.textContent = `cloudflared access rdp --hostname ${host} --url rdp://${proxyHost}:${proxyPort}`;
    wrap.removeAttribute("hidden");

    if (docLink instanceof HTMLAnchorElement) {
      const u = normalizeUrl(APP_CONFIG.cloudflaredRdpAuthDocUrl);
      if (u) docLink.href = u;
    }
  }

  function wireConnectLinks() {
    const apiBaseUrl = normalizeUrl(APP_CONFIG.apiBaseUrl);
    const accessLoginHref = normalizeUrl(APP_CONFIG.accessLoginUrl);

    document.querySelectorAll("[data-connect-link]").forEach((element) => {
      if (!(element instanceof HTMLButtonElement) && !(element instanceof HTMLAnchorElement)) {
        return;
      }

      const startEnabled = Boolean(apiBaseUrl);
      if (!startEnabled) {
        if (accessLoginHref) {
          element.removeAttribute("aria-disabled");
          element.classList.remove("is-disabled");
          if (element instanceof HTMLButtonElement) element.disabled = false;
          if (element instanceof HTMLAnchorElement) {
            element.href = accessLoginHref;
          }
        } else {
          if (element instanceof HTMLAnchorElement) element.href = "#";
          element.setAttribute("aria-disabled", "true");
          element.classList.add("is-disabled");
          if (element instanceof HTMLButtonElement) element.disabled = true;
          element.title = "Set apiBaseUrl to enable Worker-backed connect flow.";
        }
        return;
      }

      if (element instanceof HTMLAnchorElement) element.href = "#";
      element.removeAttribute("aria-disabled");
      element.classList.remove("is-disabled");
      if (element instanceof HTMLButtonElement) element.disabled = false;
    });

    if (document.body.dataset.connectDelegated === "1") {
      return;
    }
    document.body.dataset.connectDelegated = "1";
    document.body.addEventListener("click", (e) => {
      const el = e.target && e.target.closest && e.target.closest("[data-connect-link]");
      if (!el || (!(el instanceof HTMLButtonElement) && !(el instanceof HTMLAnchorElement))) {
        return;
      }

      const base = normalizeUrl(APP_CONFIG.apiBaseUrl);
      const loginHref = normalizeUrl(APP_CONFIG.accessLoginUrl);
      const enabled = Boolean(base);

      if (!enabled) {
        if (!loginHref) return;
        if (el instanceof HTMLAnchorElement) return;
        e.preventDefault();
        window.location.href = loginHref;
        return;
      }

      e.preventDefault();
      if (el.getAttribute("aria-disabled") === "true") return;
      void startRemoteSession(el, base);
    });
  }

  async function startRemoteSession(triggerEl, apiBaseUrl) {
    const originalText = triggerEl.textContent || "";
    triggerEl.setAttribute("aria-disabled", "true");
    triggerEl.classList.add("is-disabled");
    if (triggerEl instanceof HTMLButtonElement) triggerEl.disabled = true;
    triggerEl.textContent = "Starting remote session...";

    try {
      const deviceId = getOrCreateDeviceId();
      const riskContext = computeRiskContext();

      const response = await fetchApi(apiBaseUrl, "/api/session/start", {
        method: "POST",
        body: JSON.stringify({
          target_host: APP_CONFIG.targetHostId,
          protocol: "rdp",
          device_id: deviceId,
          risk_context: riskContext,
          // Only used when Cloudflare Access headers are unavailable.
          user: APP_CONFIG.mockUserEmail || undefined,
          source_ip: APP_CONFIG.mockSourceIp || undefined,
        }),
      });
      if (!response) return;

      if (!response.ok) {
        const errText = await readErrorBody(response);
        throw new Error(errText || `session/start failed with status ${response.status}`);
      }

      const payload = await response.json();
      const sessionId = payload.session_id;
      const rdpProfileUrl = payload.rdp_profile_url;

      if (!sessionId || !rdpProfileUrl) {
        throw new Error("session/start response missing session_id or rdp_profile_url");
      }

      triggerRdpDownload(apiBaseUrl, rdpProfileUrl);

      if (APP_CONFIG.enableNotifications) {
        // Worker will re-check session ownership & enrich data using Access/edge headers.
        try {
          await dispatchLoginSuccess(apiBaseUrl, sessionId, deviceId);
        } catch (err) {
          console.error("notify/login-success failed", err);
        }
      }

      triggerEl.textContent = "Session started. Downloading .rdp...";
    } catch (error) {
      console.error(error);
      triggerEl.textContent = "Start failed. Check console.";
      const msg = error instanceof Error ? error.message : String(error);
      alert(`Failed to start remote session.\n\n${msg}`);
    } finally {
      // Keep it disabled only for a short time; allow retries.
      window.setTimeout(() => {
        triggerEl.removeAttribute("aria-disabled");
        triggerEl.classList.remove("is-disabled");
        if (triggerEl instanceof HTMLButtonElement) triggerEl.disabled = false;
        triggerEl.textContent = originalText;
      }, 2500);
    }
  }

  function computeRiskContext() {
    // MVP: we can only infer local device time. Other risk signals must come from Worker/Access.
    const hour = new Date().getHours();
    const off_hours = hour < 6 || hour >= 23;
    return { off_hours };
  }

  function getOrCreateDeviceId() {
    const key = "9secvpn_device_id";
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;

    const value = `device_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    window.localStorage.setItem(key, value);
    return value;
  }

  function triggerRdpDownload(apiBaseUrl, rdpProfileUrl) {
    const urlSuffix = APP_CONFIG.mockUserEmail
      ? `?mockUserEmail=${encodeURIComponent(APP_CONFIG.mockUserEmail)}`
      : "";
    const href = `${apiBaseUrl}${rdpProfileUrl}${urlSuffix}`;
    const a = document.createElement("a");
    a.href = href;
    a.rel = "noreferrer";
    a.click();
  }

  async function dispatchLoginSuccess(apiBaseUrl, sessionId, deviceId) {
    const res = await fetchApi(apiBaseUrl, "/api/notify/login-success", {
      method: "POST",
      body: JSON.stringify({
        session_id: sessionId,
        device_id: deviceId,
        // Only used when Cloudflare Access headers are unavailable.
        user: APP_CONFIG.mockUserEmail || undefined,
      }),
    });
    if (!res) return null;

    if (!res.ok) {
      throw new Error(`notify/login-success failed with status ${res.status}`);
    }

    return res.json().catch(() => null);
  }

  async function readErrorBody(res) {
    try {
      const data = await res.clone().json();
      const m = data?.error?.message || data?.message;
      if (m) return String(m);
    } catch {
      try {
        return (await res.clone().text()).slice(0, 200);
      } catch {
        return "";
      }
    }
    return "";
  }

  async function hydrateHistoryLists() {
    const historyLists = Array.from(document.querySelectorAll("[data-history-list]"));
    if (!historyLists.length) return;

    const apiBaseUrl = normalizeUrl(APP_CONFIG.apiBaseUrl);
    if (!apiBaseUrl) {
      historyLists.forEach((list) => {
        renderEmptyState(
          list,
          "Set apiBaseUrl to enable Worker-backed login history.",
        );
      });
      return;
    }

    await Promise.all(
      historyLists.map(async (list) => {
        const limit = readLimit(list);

        try {
          const mockUserEmail = APP_CONFIG.mockUserEmail
            ? `&mockUserEmail=${encodeURIComponent(APP_CONFIG.mockUserEmail)}`
            : "";
          const response = await fetchApi(apiBaseUrl, `/api/history?limit=${limit}${mockUserEmail}`, {
            headers: {
              Accept: "application/json",
            },
          });
          if (!response) return;

          if (!response.ok) {
            throw new Error(`History request failed with status ${response.status}`);
          }

          const payload = await response.json();
          renderHistoryList(list, Array.isArray(payload.items) ? payload.items : []);
        } catch (error) {
          console.error(error);
          renderEmptyState(list, "History not available yet (auth or API may be pending).");
        }
      }),
    );
  }

  function readLimit(element) {
    const raw = element.getAttribute("data-limit");
    const parsed = Number.parseInt(raw || "", 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return APP_CONFIG.historyLimit;
    }

    return parsed;
  }

  function renderHistoryList(container, items) {
    container.innerHTML = "";

    if (!items.length) {
      renderEmptyState(container, "No login events recorded yet.");
      return;
    }

    items.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.className = "timeline-item";

      const copy = document.createElement("div");
      copy.className = "timeline-copy";

      const title = document.createElement("strong");
      const result = item.result === "failure" ? "Login Failure" : "Login Success";
      title.textContent = `${result} · ${item.user_email || item.user || "unknown user"}`;

      const meta = document.createElement("span");
      meta.className = "timeline-meta";
      meta.textContent = [
        item.target_host || APP_CONFIG.targetHostLabel,
        item.source_ip || "unknown IP",
        item.country || "unknown country",
        formatDate(item.created_at || item.occurred_at),
      ]
        .filter(Boolean)
        .join(" · ");

      copy.append(title, meta);

      const resultChip = document.createElement("span");
      resultChip.className = `chip ${item.result === "failure" ? "chip-failure" : "chip-success"}`;
      resultChip.textContent = item.result || "success";

      const riskChip = document.createElement("span");
      const risk = item.risk_level || "low";
      riskChip.className = `chip chip-${risk}`;
      riskChip.textContent = `${risk} risk`;

      listItem.append(copy, resultChip, riskChip);
      container.appendChild(listItem);
    });
  }

  function renderEmptyState(container, message) {
    container.innerHTML = "";
    const item = document.createElement("li");
    item.className = "empty-state";
    item.textContent = message;
    container.appendChild(item);
  }

  function formatDate(value) {
    if (!value) return "time unavailable";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("zh-TW", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function normalizeUrl(value) {
    return String(value || "").trim().replace(/\/$/, "");
  }
})();
