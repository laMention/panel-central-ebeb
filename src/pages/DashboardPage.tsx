import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePlatformState } from "@/hooks/usePlatformState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { PlatformStatut } from "@/repositories/PlatformStateRepository";

const STATUTS: { value: PlatformStatut; label: string; description: string }[] = [
  { value: "ACTIVE", label: "Active", description: "Fonctionnement normal de la plateforme." },
  { value: "MAINTENANCE", label: "Maintenance", description: "Accès temporairement indisponible." },
  { value: "DESACTIVEE", label: "Désactivée", description: "Arrêt complet (kill switch)." },
];

const BADGE_STYLES: Record<PlatformStatut, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  MAINTENANCE: "bg-amber-100 text-amber-800",
  DESACTIVEE: "bg-red-100 text-red-800",
};

export function DashboardPage() {
  const { admin, logout } = useAuth();
  const { etat, loading, error, changerStatut } = usePlatformState();

  const [statut, setStatut] = useState<PlatformStatut>("ACTIVE");
  const [message, setMessage] = useState("");
  const [motif, setMotif] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const applyChange = async () => {
    setSubmitting(true);
    setFeedback(null);
    try {
      await changerStatut({
        statut,
        message: message || null,
        motif: motif || null,
        date_debut: dateDebut || null,
        date_fin: dateFin || null,
        confirmation: statut !== "ACTIVE",
      });
      setFeedback("État de la plateforme mis à jour.");
    } catch {
      setFeedback("Échec de la mise à jour. Vérifiez les champs et réessayez.");
    } finally {
      setSubmitting(false);
      setPendingConfirm(false);
    }
  };

  const handleSubmit = () => {
    if (statut === "MAINTENANCE" || statut === "DESACTIVEE") {
      setPendingConfirm(true);
    } else {
      applyChange();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Panel central</h1>
            <p className="text-xs text-slate-500">
              {admin ? `${admin.prenom ?? ""} ${admin.nom}`.trim() : "Super Administrateur"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/historique" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Historique
            </Link>
            <button
              onClick={() => logout()}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {loading && <p className="text-sm text-slate-500">Chargement de l'état de la plateforme…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {etat && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${BADGE_STYLES[etat.statut]}`}>
                {etat.statut}
              </span>
              {etat.statut_configure !== etat.statut && (
                <span className="text-xs text-slate-500">
                  (planifié : {etat.statut_configure}, démarre le{" "}
                  {etat.date_debut ? new Date(etat.date_debut).toLocaleString("fr-FR") : "—"})
                </span>
              )}
            </div>
            {etat.message && <p className="mt-2 text-sm text-slate-700">{etat.message}</p>}
          </div>
        )}

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Changer l'état de la plateforme</h2>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {STATUTS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatut(s.value)}
                className={`rounded-lg border p-3 text-left text-sm ${
                  statut === s.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-700 hover:border-slate-400"
                }`}
              >
                <div className="font-semibold">{s.label}</div>
                <div className={`mt-0.5 text-xs ${statut === s.value ? "text-slate-300" : "text-slate-500"}`}>
                  {s.description}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">
                Message affiché aux utilisateurs
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="La plateforme est actuellement indisponible. Veuillez réessayer ultérieurement."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">Motif (interne)</label>
              <textarea
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Date de début (optionnel)</label>
              <input
                type="datetime-local"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Date de fin (optionnel)</label>
              <input
                type="datetime-local"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {feedback && <p className="mt-4 text-sm text-slate-700">{feedback}</p>}

          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? "Application…" : "Appliquer"}
          </button>
        </div>
      </main>

      {pendingConfirm && (
        <ConfirmDialog
          title={statut === "DESACTIVEE" ? "Désactiver la plateforme ?" : "Passer en maintenance ?"}
          description={
            statut === "DESACTIVEE"
              ? "Toutes les API (mobile et admin) seront bloquées immédiatement, y compris l'authentification. Confirmez-vous cette action ?"
              : "Toutes les opérations métier seront bloquées jusqu'à la fin de la maintenance. Confirmez-vous cette action ?"
          }
          confirmLabel="Confirmer"
          danger={statut === "DESACTIVEE"}
          onConfirm={applyChange}
          onCancel={() => setPendingConfirm(false)}
        />
      )}
    </div>
  );
}
