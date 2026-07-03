import { useState } from "react";
import { Link } from "react-router-dom";
import { usePlatformHistorique } from "@/hooks/usePlatformState";

export function HistoryPage() {
  const [page, setPage] = useState(1);
  const { historique, loading } = usePlatformHistorique(page);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">Historique des changements d'état</h1>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Retour
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {loading && <p className="text-sm text-slate-500">Chargement…</p>}

        {historique && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Changement</th>
                  <th className="px-4 py-3">Administrateur</th>
                  <th className="px-4 py-3">Motif</th>
                </tr>
              </thead>
              <tbody>
                {historique.data.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(item.created_at).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {item.statut_precedent} → {item.statut_nouveau}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.modifie_par
                        ? `${item.modifie_par.prenom ?? ""} ${item.modifie_par.nom}`.trim()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.motif ?? "—"}</td>
                  </tr>
                ))}
                {historique.data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      Aucun changement enregistré.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {historique && historique.last_page > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="text-slate-500">
              Page {historique.current_page} / {historique.last_page}
            </span>
            <button
              disabled={page >= historique.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
