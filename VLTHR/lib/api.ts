const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export async function fetchFromBackend(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${BACKEND_URL}${path}`);
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
