const getBackendUrl = () => {
  let url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

// Debug: log once on module load
if (typeof window !== 'undefined') {
  console.log('[API] Backend URL:', getBackendUrl());
}

export async function fetchFromBackend(path: string, params: Record<string, string> = {}) {
  const baseUrl = getBackendUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${cleanPath}`);
  Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, val));

  const urlStr = url.toString();
  console.log(`[API] Fetching: ${urlStr}`);

  try {
    const res = await fetch(urlStr, {
      headers: { 'Accept': 'application/json' }
    });
    console.log(`[API] Response: ${res.status} for ${path}`);
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`[API] Fetch Error (${path}):`, error);
    return null;
  }
}

/**
 * Ping the backend health endpoint to verify connectivity.
 * Returns true if backend is reachable.
 */
export async function checkBackendHealth(): Promise<boolean> {
  const baseUrl = getBackendUrl();
  try {
    const res = await fetch(`${baseUrl}/health`, { method: 'GET', cache: 'no-store' });
    const ok = res.ok;
    console.log(`[API] Health check: ${res.status}`);
    return ok;
  } catch (e) {
    console.error('[API] Health check FAILED:', e);
    return false;
  }
}
