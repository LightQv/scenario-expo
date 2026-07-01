import { CONFIG } from "@/services/config";

export class ApiError extends Error {
  status: number;
  body?: unknown;
  rawBody?: string;

  constructor(status: number, message: string, body?: unknown, rawBody?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.rawBody = rawBody;
  }
}

function parseResponseText(text: string) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(status: number, body: unknown, rawBody: string) {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
  }

  if (typeof body === "string" && body.length > 0) return body;
  if (rawBody.length > 0) return rawBody;

  return `API Error ${status}`;
}

// --- Fetch wrapper ---
async function request(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await res.text();
  const body = parseResponseText(text);

  if (!res.ok) {
    throw new ApiError(res.status, getErrorMessage(res.status, body, text), body, text);
  }

  return body;
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
