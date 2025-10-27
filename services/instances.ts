import { CONFIG } from "@/services/config";

// --- Fetch wrapper ---
async function request(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return res.json();
}

// --- TMDB fetch ---
export async function tmdbFetch(path: string, options: RequestInit = {}) {
  return request(`https://api.themoviedb.org/3${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${CONFIG.tmdbToken}`,
      ...options.headers,
    },
  });
}

// --- Backend fetch ---
export async function apiFetch(path: string, options: RequestInit = {}) {
  return request(`${CONFIG.apiBaseUrl}${path}`, {
    ...options,
    credentials: "include",
  });
}
