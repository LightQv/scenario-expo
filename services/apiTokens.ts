import { apiFetch } from "@/services/instances";

export type ApiTokenListItem = {
  id: string;
  name: string;
  scopes: string[];
  created_at: string;
  last_used_at?: string | null;
};

export type ApiTokenDetail = ApiTokenListItem & {
  token: string;
};

export type ApiTokenCreatePayload = {
  name: string;
  token: string;
};

export function listApiTokens(): Promise<ApiTokenListItem[]> {
  return apiFetch("/api/v1/api-tokens");
}

export function getApiToken(id: string): Promise<ApiTokenDetail> {
  return apiFetch(`/api/v1/api-tokens/${id}`);
}

export function generateApiToken(): Promise<{ token: string }> {
  return apiFetch("/api/v1/api-tokens/generate", { method: "POST" });
}

export function createApiToken(payload: ApiTokenCreatePayload): Promise<ApiTokenDetail> {
  return apiFetch("/api/v1/api-tokens", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function revokeApiToken(id: string): Promise<{ revoked: boolean }> {
  return apiFetch(`/api/v1/api-tokens/${id}`, { method: "DELETE" });
}
