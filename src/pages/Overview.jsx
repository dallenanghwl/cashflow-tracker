import { useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext.jsx'
import { PaymentCard } from '../components/PaymentCard.jsx'

function differenceInDays(from, to) {
  const a = new Date(from)
  const b = new Date(to)
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

export function Overview() {
  const { allOutflows, horizonDays, setHorizonDays, openingBalance, saveOpeningBalance, settings } =
    useAppContext()
  const [balanceOpen, setBalanceOpen] = useState(false)
  const [balanceValue, setBalanceValue] = useState(openingBalance.toString())
  const [balanceSaving, setBalanceSaving] = useState(false)

  const todayStr = new Date().toISOString().slice(0, 10)
  const tomorrowStr = new Date(new Date(todayStr).getTime() + 86400000).toISOString().slice(0, 10)

  const buckets = useMemo(() => {
    const overdue = []
    const today = []
    const tomorrow = []
    const thisWeek = []
    const later = []

    allOutflows.forEach((p) => {
      if (!p.due_date) return
      const diff = differenceInDays(todayStr, p.due_date)
      if (p.status === 'Paid') return
      if (diff < 0) overdue.push(p)
      else if (diff === 0) today.push(p)
      else if (diff === 1) tomorrow.push(p)
      else if (diff <= 7) thisWeek.push(p)
      else if (diff <= horizonDays) later.push(p)
    })

    const sortByDueDateAsc = (a, b) => (a.due_date || '').localeCompare(b.due_date || '')
    overdue.sort(sortByDueDateAsc)
    today.sort(sortByDueDateAsc)
    tomorrow.sort(sortByDueDateAsc)
    thisWeek.sort(sortByDueDateAsc)
    later.sort(sortByDueDateAsc)

    const total = (list) => list.reduce((sum, p) => sum + Number(p.amount || 0), 0)

    return {
      overdue,
      today,
      tomorrow,
      thisWeek,
      later,
      totals: {
        overdue: total(overdue),
        today: total(today),
        tomorrow: total(tomorrow),
        thisWeek: total(thisWeek),
        later: total(later),
      },
    }
  }, [allOutflows, horizonDays, todayStr])

  const handleSaveBalance = async (e) => {
    e.preventDefault()
    const num = Number(balanceValue || 0)
    setBalanceSaving(true)
    await saveOpeningBalance(num)
    setBalanceSaving(false)
    setBalanceOpen(false)
  }

  const format = (n) =>
    n.toLocaleString(undefined, {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    })

  const renderGroup = (label, items, total, highlight = false) => {
    if (!items.length) return null
    return (
      <section key={label} className="mb-4">
        <header className="flex items-baseline justify-between mb-1">
          <h2 className={`font-heading text-base ${highlight ? 'text-red-300' : ''}`}>{label}</h2>
          <p className={`text-xs ${highlight ? 'text-red-300' : 'text-slate-300'}`}>
            Total going out:{' '}
            <span className="font-semibold text-red-400">
              -{format(total)}
            </span>
          </p>
        </header>
        {items.map((p) => (
          <PaymentCard key={p.id} payment={p} />
        ))}
      </section>
    )
  }

  const anyItems =
    buckets.overdue.length ||
    buckets.today.length ||
    buckets.tomorrow.length ||
    buckets.thisWeek.length ||
    buckets.later.length

  const lastUpdatedSetting = settings.find((s) => s.key === 'opening_balance_updated_at')
  const lastUpdatedLabel = lastUpdatedSetting
    ? new Date(lastUpdatedSetting.value).toLocaleString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="pb-4">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl mb-1">Cashflow overview</h1>
          <p className="text-sm text-slate-300">
            See what&apos;s coming up and whether you can afford it.
          </p>
        </div>
      </header>

      <section className="rounded-2xl bg-card px-4 py-4 border border-slate-800 mb-4">
        <p className="text-xs text-slate-300 mb-1">Current bank balance</p>
        <p className="font-heading text-4xl tracking-tight mb-1">
          {format(openingBalance)}
        </p>
        {lastUpdatedLabel && (
          <p className="text-[11px] text-slate-400 mb-3">
            Last updated {lastUpdatedLabel}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            setBalanceValue(openingBalance.toString())
            setBalanceOpen(true)
          }}
          className="mt-2 w-full min-h-[44px] rounded-2xl bg-accent text-slate-950 text-sm font-semibold"
        >
          Update balance
        </button>
      </section>

      <div className="flex gap-2 mb-4">
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setHorizonDays(d)}
            className={`flex-1 min-h-[36px] rounded-full text-xs border font-medium ${
              horizonDays === d
                ? 'bg-accent text-slate-950 border-accent'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            {d} days
          </button>
        ))}
      </div>

      {balanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-4 shadow-xl">
            <h2 className="font-heading text-lg mb-2">Update balance</h2>
            <p className="text-sm text-slate-300 mb-3">What is your bank balance right now?</p>
            <form onSubmit={handleSaveBalance} className="space-y-3">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                value={balanceValue}
                onChange={(e) => setBalanceValue(e.target.value)}
                className="w-full rounded-2xl bg-slate-800 border border-slate-700 px-3 py-3 text-lg font-heading"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBalanceOpen(false)}
                  className="flex-1 min-h-[48px] rounded-2xl border border-slate-600 text-slate-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={balanceSaving}
                  className="flex-1 min-h-[48px] rounded-2xl bg-accent text-slate-950 font-semibold text-sm"
                >
                  Save balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!anyItems ? (
        <div className="mt-6 rounded-2xl bg-card border border-slate-800 px-4 py-6 text-center">
          <p className="font-heading text-lg mb-1">Nothing due soon 🎉</p>
          <p className="text-sm text-slate-300">
            You don&apos;t have any payments scheduled in this period.
          </p>
        </div>
      ) : (
        <div className="mt-4">
          {renderGroup('Overdue', buckets.overdue, buckets.totals.overdue, true)}
          {renderGroup('Today', buckets.today, buckets.totals.today)}
          {renderGroup('Tomorrow', buckets.tomorrow, buckets.totals.tomorrow)}
          {renderGroup('This week', buckets.thisWeek, buckets.totals.thisWeek)}
          {(horizonDays === 14 || horizonDays === 30) &&
            renderGroup('Later', buckets.later, buckets.totals.later)}
        </div>
      )}
    </div>
  )
}

