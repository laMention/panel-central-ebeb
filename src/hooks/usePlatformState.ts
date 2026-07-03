import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import * as PlatformStateRepository from "@/repositories/PlatformStateRepository";
import type {
  ChangerEtatPayload,
  PaginatedResult,
  PlatformEtatEffectif,
  PlatformHistoriqueItem,
} from "@/repositories/PlatformStateRepository";

export function usePlatformState() {
  const { token } = useAuth();
  const [etat, setEtat] = useState<PlatformEtatEffectif | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setEtat(await PlatformStateRepository.getEtat(token));
    } catch {
      setError("Impossible de récupérer l'état de la plateforme.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const changerStatut = useCallback(
    async (payload: ChangerEtatPayload) => {
      if (!token) return;
      await PlatformStateRepository.updateEtat(payload, token);
      await refresh();
    },
    [token, refresh],
  );

  return { etat, loading, error, refresh, changerStatut };
}

export function usePlatformHistorique(page: number) {
  const { token } = useAuth();
  const [historique, setHistorique] = useState<PaginatedResult<PlatformHistoriqueItem> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    PlatformStateRepository.getHistorique(token, page)
      .then(setHistorique)
      .finally(() => setLoading(false));
  }, [token, page]);

  return { historique, loading };
}
