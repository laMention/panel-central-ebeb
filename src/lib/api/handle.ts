import { getApiBaseUrl } from "@/lib/config";
import { reportSessionExpired } from "@/lib/sessionExpiry";

/** Options communes à toutes les requêtes. */
interface BaseOptions {
  /** Bearer token pour l'en-tête Authorization. */
  token?: string;
  /**
   * N'active pas la gestion globale d'expiration de session sur un 401 de
   * cet appel précis (ex. la révocation du token pendant une déconnexion
   * volontaire, déjà gérée par son propre appelant).
   */
  skipSessionExpiryHandling?: boolean;
}

/** Options spécifiques aux requêtes avec corps (POST / PUT / PATCH). */
interface MutationOptions extends BaseOptions {
  body?: unknown;
}

/** Erreur levée pour toute réponse HTTP dont le statut est >= 400. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
  ) {
    super(`HTTP ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

function buildHeaders(token?: string): Headers {
  const headers = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
  });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

function apiUrl(path: string): string {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

async function request<T>(url: string, init: RequestInit, skipSessionExpiryHandling = false): Promise<T> {
  const response = await fetch(url, init);

  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    if (response.status === 401 && !skipSessionExpiryHandling) {
      const hadToken = init.headers instanceof Headers && init.headers.has("Authorization");
      if (hadToken) reportSessionExpired();
    }
    throw new ApiError(response.status, response.statusText, body);
  }

  return body as T;
}

export async function get<T>(path: string, options: BaseOptions = {}): Promise<T> {
  return request<T>(apiUrl(path), {
    method: "GET",
    headers: buildHeaders(options.token),
  }, options.skipSessionExpiryHandling);
}

export async function post<T>(path: string, options: MutationOptions = {}): Promise<T> {
  return request<T>(apiUrl(path), {
    method: "POST",
    headers: buildHeaders(options.token),
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  }, options.skipSessionExpiryHandling);
}

export async function put<T>(path: string, options: MutationOptions = {}): Promise<T> {
  return request<T>(apiUrl(path), {
    method: "PUT",
    headers: buildHeaders(options.token),
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  }, options.skipSessionExpiryHandling);
}
