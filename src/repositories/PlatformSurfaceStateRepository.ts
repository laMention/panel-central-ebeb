import { get, put } from "@/lib/api/handle";

const BASE = "/control-panel";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type Surface = "SITE_WEB" | "PANEL_ADMIN";
export type SurfaceStatut = "ACTIF" | "DESACTIVE";

export interface SurfaceEtat {
  surface: Surface;
  statut: SurfaceStatut;
  message: string | null;
  modifie_par: string | null;
  updated_at: string | null;
}

export interface ChangerEtatSurfacePayload {
  statut: SurfaceStatut;
  message?: string | null;
}

export async function getSurfaces(token: string) {
  const res = await get<Envelope<Record<Surface, SurfaceEtat>>>(`${BASE}/surfaces`, { token });
  return res.data;
}

export async function updateSurface(surface: Surface, payload: ChangerEtatSurfacePayload, token: string) {
  const res = await put<Envelope<SurfaceEtat>>(`${BASE}/surfaces/${surface}`, { body: payload, token });
  return res.data;
}
