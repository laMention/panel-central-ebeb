// ---------------------------------------------------------------------------
// Gestion centralisée de l'expiration de session (401 sur une requête
// authentifiée). Module plain — appelé depuis la couche HTTP (lib/api/handle.ts),
// hors contexte React : on nettoie le token local et on force une redirection
// complète vers /login (garantit qu'aucun appel en cours ne continue avec le
// token mort).
// ---------------------------------------------------------------------------

const STORAGE_KEY = "control-panel-token";
const EXPIRED_FLAG_KEY = "control-panel-session-expired";

/** Anti-doublon : plusieurs requêtes en parallèle peuvent 401 simultanément. */
let handled = false;

/** À appeler après une (re)connexion réussie pour réarmer la détection. */
export function resetSessionExpiry(): void {
  handled = false;
}

/**
 * Signale qu'une requête authentifiée a reçu un 401. No-op si déjà traité
 * ou si déjà sur /login.
 */
export function reportSessionExpired(): void {
  if (handled) return;
  handled = true;

  sessionStorage.removeItem(STORAGE_KEY);

  if (window.location.pathname.startsWith("/login")) return;

  sessionStorage.setItem(EXPIRED_FLAG_KEY, "1");
  window.location.href = "/login";
}

/**
 * Consomme (une seule fois) le drapeau posé par reportSessionExpired — à
 * appeler au montage de la page de connexion pour afficher le message.
 */
export function consumeSessionExpiredFlag(): boolean {
  const wasSet = sessionStorage.getItem(EXPIRED_FLAG_KEY) === "1";
  if (wasSet) sessionStorage.removeItem(EXPIRED_FLAG_KEY);
  return wasSet;
}
