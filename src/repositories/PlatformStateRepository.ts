import { get, post, put } from "@/lib/api/handle";

const BASE = "/control-panel";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type PlatformStatut = "ACTIVE" | "MAINTENANCE" | "DESACTIVEE";

export interface AdminResume {
  id: string;
  nom: string;
  prenom: string | null;
  email: string;
}

export interface PlatformEtatEffectif {
  statut: PlatformStatut;
  statut_configure: PlatformStatut;
  message: string | null;
  motif: string | null;
  date_debut: string | null;
  date_fin: string | null;
  modifie_par: string | null;
  updated_at: string | null;
}

export interface PlatformHistoriqueItem {
  id: string;
  statut_precedent: PlatformStatut;
  statut_nouveau: PlatformStatut;
  message: string | null;
  motif: string | null;
  date_debut: string | null;
  date_fin: string | null;
  ip_adresse: string | null;
  created_at: string;
  modifie_par: AdminResume | null;
}

export interface PaginatedResult<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ChangerEtatPayload {
  statut: PlatformStatut;
  message?: string | null;
  motif?: string | null;
  date_debut?: string | null;
  date_fin?: string | null;
  confirmation?: boolean;
}

export async function login(email: string, password: string, token?: string) {
  const res = await post<Envelope<{ admin: AdminResume; token: string }>>(`${BASE}/auth/se-connecter`, {
    body: { email, password },
    token,
  });
  return res.data;
}

export async function logout(token: string) {
  // La déconnexion volontaire gère déjà elle-même le nettoyage/la redirection
  // (voir useAuth.logout) — ne pas déclencher la gestion globale de 401.
  await post(`${BASE}/auth/se-deconnecter`, { token, skipSessionExpiryHandling: true });
}

export async function getEtat(token: string) {
  const res = await get<Envelope<PlatformEtatEffectif>>(`${BASE}/etat`, { token });
  return res.data;
}

export async function updateEtat(payload: ChangerEtatPayload, token: string) {
  const res = await put<Envelope<unknown>>(`${BASE}/etat`, { body: payload, token });
  return res.data;
}

export async function getHistorique(token: string, page = 1) {
  const res = await get<Envelope<PaginatedResult<PlatformHistoriqueItem>>>(
    `${BASE}/historique?page=${page}`,
    { token },
  );
  return res.data;
}
