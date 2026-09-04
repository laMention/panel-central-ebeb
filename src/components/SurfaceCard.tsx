import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { SurfaceEtat, SurfaceStatut } from "@/repositories/PlatformSurfaceStateRepository";

interface SurfaceCardProps {
  title: string;
  description: string;
  etat: SurfaceEtat | null;
  onChange: (statut: SurfaceStatut, message: string | null) => Promise<void>;
}

const BADGE_STYLES: Record<SurfaceStatut, string> = {
  ACTIF: "bg-emerald-100 text-emerald-800",
  DESACTIVE: "bg-red-100 text-red-800",
};

const BADGE_LABELS: Record<SurfaceStatut, string> = {
  ACTIF: "Actif",
  DESACTIVE: "Désactivé",
};

export function SurfaceCard({ title, description, etat, onChange }: SurfaceCardProps) {
  const [message, setMessage] = useState("");
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const statut = etat?.statut ?? "ACTIF";
  const isActif = statut === "ACTIF";

  const applyToggle = async () => {
    setSubmitting(true);
    try {
      await onChange(isActif ? "DESACTIVE" : "ACTIF", isActif ? message || null : null);
      setMessage("");
    } finally {
      setSubmitting(false);
      setPendingConfirm(false);
    }
  };

  const handleClick = () => {
    if (isActif) {
      setPendingConfirm(true);
    } else {
      applyToggle();
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${BADGE_STYLES[statut]}`}>
          {BADGE_LABELS[statut]}
        </span>
      </div>

      {etat?.message && (
        <p className="mt-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">{etat.message}</p>
      )}

      {isActif && (
        <div className="mt-4">
          <label className="text-xs font-medium text-slate-600">
            Message affiché sur la page de maintenance (optionnel)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      )}

      <button
        type="button"
        disabled={submitting}
        onClick={handleClick}
        className={`mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
          isActif ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        {submitting ? "Application…" : isActif ? "Désactiver" : "Réactiver"}
      </button>

      {pendingConfirm && (
        <ConfirmDialog
          title={`Désactiver ${title} ?`}
          description={`L'accès à ${title.toLowerCase()} sera immédiatement bloqué et une page de maintenance sera affichée aux visiteurs. Cette action n'affecte aucune autre surface.`}
          confirmLabel="Désactiver"
          danger
          onConfirm={applyToggle}
          onCancel={() => setPendingConfirm(false)}
        />
      )}
    </div>
  );
}
