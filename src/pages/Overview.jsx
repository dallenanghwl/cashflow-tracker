import { useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext.jsx'
import { HealthBanner } from '../components/HealthBanner.jsx'
import { SummaryCards } from '../components/SummaryCards.jsx'
import { PaymentCard } from '../components/PaymentCard.jsx'

const OVERVIEW_TABS = [
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'week', label: 'This Week' },
]

function differenceInDays(from, to) {
  const a = new Date(from)
  const b = new Date(to)
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

export function Overview() {
  const { allOutflows, horizonDays, setHorizonDays, addInflow } = useAppContext()
  const [overviewTab, setOverviewTab] = useState('week')
  const [cashSalesOpen, setCashSalesOpen] = useState(false)
  const [cashSalesAmount, setCashSalesAmount] = useState('')
  const [cashSalesSubmitting, setCashSalesSubmitting] = useState(false)

  const todayStr = new Date().toISOString().slice(0, 10)
  const tomorrowStr = new Date(new Date(todayStr).getTime() + 86400000).toISOString().slice(0, 10)

  const buckets = useMemo(() => {
    const today = []
    const tomorrow = []
    const thisWeek = []
    const comingUp = []

    allOutflows.forEach((p) => {
      if (!p.due_date) return
      const diff = differenceInDays(todayStr, p.due_date)
      if (diff < 0) return
      if (diff === 0) today.push(p)
      else if (diff === 1) tomorrow.push(p)
      else if (diff <= 7) thisWeek.push(p)
      else if (diff <= horizonDays) comingUp.push(p)
    })

    const total = (list) => list.reduce((sum, p) => sum + Number(p.amount || 0), 0)

    return {
      today,
      tomorrow,
      thisWeek,
      comingUp,
      totals: {
        today: total(today),
        tomorrow: total(tomorrow),
        thisWeek: total(thisWeek),
        comingUp: total(comingUp),
      },
    }
  }, [allOutflows, horizonDays, todayStr])

  const handleAddCashSales = async (e) => {
    e.preventDefault()
    const amount = Number(cashSalesAmount)
    if (!amount || amount <= 0) return
    setCashSalesSubmitting(true)
    await addInflow({
      amount,
      expected_date: todayStr,
      category: 'Cash Sales',
      status: 'Received',
      description: 'Cash Sales',
    })
    setCashSalesAmount('')
    setCashSalesOpen(false)
    setCashSalesSubmitting(false)
  }

  const format = (n) =>
    n.toLocaleString(undefined, {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    })

  const renderGroup = (label, items, total) => {
    if (!items.length) return null
    return (
      <section key={label} className="mb-4">
        <header className="flex items-baseline justify-between mb-1">
          <h2 className="font-heading text-base">{label}</h2>
          <p className="text-xs text-slate-300">
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

  const scopeForTab = overviewTab === 'today' ? 'today' : overviewTab === 'tomorrow' ? 'tomorrow' : 'week'
  const scopeDays = overviewTab === 'week' ? horizonDays : 7

  const itemsForTab =
    overviewTab === 'today'
      ? buckets.today
      : overviewTab === 'tomorrow'
        ? buckets.tomorrow
        : [...buckets.today, ...buckets.tomorrow, ...buckets.thisWeek, ...buckets.comingUp]
  const totalForTab =
    overviewTab === 'today'
      ? buckets.totals.today
      : overviewTab === 'tomorrow'
        ? buckets.totals.tomorrow
        : buckets.totals.today +
          buckets.totals.tomorrow +
          buckets.totals.thisWeek +
          buckets.totals.comingUp
  const noItems = itemsForTab.length === 0
  const periodLabel =
    overviewTab === 'today'
      ? 'Today'
      : overviewTab === 'tomorrow'
        ? 'Tomorrow'
        : `Next ${horizonDays} days`

  return (
    <div className="pb-4">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl mb-1">Cashflow overview</h1>
          <p className="text-sm text-slate-300">
            See what&apos;s coming up and whether you can afford it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCashSalesOpen(true)}
          className="shrink-0 min-h-[40px] rounded-2xl bg-accent text-slate-950 text-xs font-semibold px-3"
        >
          Add Cash Sales
        </button>
      </header>

      <div className="flex gap-1 mb-4">
        {OVERVIEW_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setOverviewTab(t.id)}
            className={`flex-1 min-h-[40px] rounded-full text-sm border ${
              overviewTab === t.id
                ? 'bg-accent text-slate-950 border-accent font-semibold'
                : 'bg-slate-900 border-slate-700 text-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

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

      <HealthBanner />
      <SummaryCards scope={scopeForTab} scopeDays={scopeDays} />

      {cashSalesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-4 shadow-xl">
            <h2 className="font-heading text-lg mb-2">Add Cash Sales</h2>
            <p className="text-sm text-slate-300 mb-3">Enter the amount received today.</p>
            <form onSubmit={handleAddCashSales} className="space-y-3">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                value={cashSalesAmount}
                onChange={(e) => setCashSalesAmount(e.target.value)}
                className="w-full rounded-2xl bg-slate-800 border border-slate-700 px-3 py-3 text-lg font-heading"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setCashSalesOpen(false); setCashSalesAmount('') }}
                  className="flex-1 min-h-[48px] rounded-2xl border border-slate-600 text-slate-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cashSalesSubmitting || !cashSalesAmount}
                  className="flex-1 min-h-[48px] rounded-2xl bg-accent text-slate-950 font-semibold text-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {noItems ? (
        <div className="mt-6 rounded-2xl bg-card border border-slate-800 px-4 py-6 text-center">
          <p className="font-heading text-lg mb-1">Nothing due {periodLabel.toLowerCase()} 🎉</p>
          <p className="text-sm text-slate-300">
            You don&apos;t have any payments scheduled in this period.
          </p>
        </div>
      ) : (
        <div className="mt-4">
          {renderGroup(periodLabel, itemsForTab, totalForTab)}
        </div>
      )}
    </div>
  )
}

