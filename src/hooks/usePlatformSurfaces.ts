import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import * as PlatformSurfaceStateRepository from "@/repositories/PlatformSurfaceStateRepository";
import type {
  ChangerEtatSurfacePayload,
  Surface,
  SurfaceEtat,
} from "@/repositories/PlatformSurfaceStateRepository";

export function usePlatformSurfaces() {
  const { token } = useAuth();
  const [etats, setEtats] = useState<Record<Surface, SurfaceEtat> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setEtats(await PlatformSurfaceStateRepository.getSurfaces(token));
    } catch {
      setError("Impossible de récupérer l'état des surfaces.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const changerStatutSurface = useCallback(
    async (surface: Surface, payload: ChangerEtatSurfacePayload) => {
      if (!token) return;
      await PlatformSurfaceStateRepository.updateSurface(surface, payload, token);
      await refresh();
    },
    [token, refresh],
  );

  return { etats, loading, error, refresh, changerStatutSurface };
}
