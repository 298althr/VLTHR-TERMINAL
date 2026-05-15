const getBackendUrl = () => {
  let url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  
  // Force https if it's a production railway URL and protocol is missing
  if (url.includes('railway.app') && !url.startsWith('http')) {
    url = `https://${url}`;
  }
  
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export async function fetchFromBackend(path: string, params: Record<string, string> = {}) {
  const baseUrl = getBackendUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${baseUrl}${cleanPath}`);
  Object.entries(params).forEach(([key, val]) => url.searchParams.append(key, val));
  
  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`API Fetch Error (${path}):`, error);
    return null;
  }
}
