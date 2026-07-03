import { getApiBaseUrl } from "@/lib/config";

/** Options communes à toutes les requêtes. */
interface BaseOptions {
  /** Bearer token pour l'en-tête Authorization. */
  token?: string;
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

async function request<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, body);
  }

  return body as T;
}

export async function get<T>(path: string, options: BaseOptions = {}): Promise<T> {
  return request<T>(apiUrl(path), {
    method: "GET",
    headers: buildHeaders(options.token),
  });
}

export async function post<T>(path: string, options: MutationOptions = {}): Promise<T> {
  return request<T>(apiUrl(path), {
    method: "POST",
    headers: buildHeaders(options.token),
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

export async function put<T>(path: string, options: MutationOptions = {}): Promise<T> {
  return request<T>(apiUrl(path), {
    method: "PUT",
    headers: buildHeaders(options.token),
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}
