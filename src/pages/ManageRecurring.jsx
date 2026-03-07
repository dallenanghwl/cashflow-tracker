import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'

function nextDue(rec) {
  const today = new Date().toISOString().slice(0, 10)
  if (!rec.start_date) return null
  if (rec.start_date >= today) return rec.start_date
  return rec.start_date
}

export function ManageRecurring() {
  const { recurring, toggleRecurringActive, deleteRecurring } = useAppContext()

  return (
    <div>
      <header className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl mb-1">Recurring payments</h1>
          <p className="text-sm text-slate-300">
            Manage regular outgoing payments.
          </p>
        </div>
        <Link
          to="/add-recurring"
          className="min-h-[40px] rounded-2xl bg-accent text-slate-950 text-xs font-semibold px-3"
        >
          + Add
        </Link>
      </header>

      {recurring.length === 0 ? (
        <div className="rounded-2xl bg-card border border-slate-800 px-4 py-6 text-center">
          <p className="font-heading text-lg mb-1">No recurring payments yet</p>
          <p className="text-sm text-slate-300">
            Add things like rent, subscriptions, or wages so they&apos;re always in your
            forecast.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recurring.map((r) => {
            const active = r.active !== false
            const next = nextDue(r)
            return (
              <article
                key={r.id}
                className="rounded-2xl bg-card border border-slate-800 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-lg leading-tight">{r.payee}</p>
                    <p className="text-xs text-slate-300">
                      {r.frequency} •{' '}
                      {['Monthly', 'Quarterly', 'Yearly'].includes(r.frequency) && r.day_of_month
                        ? `on day ${r.day_of_month}`
                        : 'regular'}
                    </p>
                    {next && (
                      <p className="text-xs text-slate-400 mt-1">
                        Next due around{' '}
                        {new Date(next).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    )}
                    {r.category && (
                      <p className="text-[11px] text-slate-300 mt-1">{r.category}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-xl text-red-400">
                      -
                      {Number(r.amount || 0).toLocaleString(undefined, {
                        style: 'currency',
                        currency: 'SGD',
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <span
                      className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[11px] ${
                        active
                          ? 'bg-emerald-900/80 text-emerald-100'
                          : 'bg-slate-700 text-slate-100'
                      }`}
                    >
                      {active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link
                    to={`/edit-recurring/${r.id}`}
                    className="min-w-[80px] min-h-[48px] rounded-2xl border border-slate-600 text-slate-200 text-xs font-semibold flex items-center justify-center"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleRecurringActive(r.id, !active)}
                    className="flex-1 min-h-[48px] rounded-2xl bg-slate-800 text-slate-100 text-sm font-semibold"
                  >
                    {active ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRecurring(r.id)}
                    className="min-w-[80px] min-h-[48px] rounded-2xl border border-slate-700 text-xs text-slate-200"
                  >
                    Delete
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

