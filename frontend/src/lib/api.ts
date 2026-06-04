let API_BASE = "http://localhost:8000";

// Try to load runtime config (for GitHub Pages deployment)
if (typeof window !== "undefined") {
  try {
    const resp = await fetch("/api-config.json", { signal: AbortSignal.timeout(2000) });
    if (resp.ok) {
      const cfg = await resp.json();
      if (cfg.apiBase) API_BASE = cfg.apiBase;
    }
  } catch {
    // Fall back to default
  }
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function apiPost<T>(endpoint: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export { API_BASE };
