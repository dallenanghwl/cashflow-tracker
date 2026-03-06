import { useMemo } from 'react'
import { useAppContext } from '../context/AppContext.jsx'
import { HealthBanner } from '../components/HealthBanner.jsx'
import { SummaryCards } from '../components/SummaryCards.jsx'
import { PaymentCard } from '../components/PaymentCard.jsx'

function differenceInDays(from, to) {
  const a = new Date(from)
  const b = new Date(to)
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

export function Overview() {
  const { allOutflows, horizonDays, setHorizonDays } = useAppContext()

  const todayStr = new Date().toISOString().slice(0, 10)
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

  const noItems =
    buckets.today.length +
      buckets.tomorrow.length +
      buckets.thisWeek.length +
      buckets.comingUp.length ===
    0

  return (
    <div className="pb-4">
      <header className="mb-3">
        <h1 className="font-heading text-2xl mb-1">Cashflow overview</h1>
        <p className="text-sm text-slate-300">
          See what&apos;s coming up and whether you can afford it.
        </p>
      </header>

      <div className="flex gap-2 mb-4">
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setHorizonDays(d)}
            className={`flex-1 min-h-[40px] rounded-full text-sm border ${
              horizonDays === d
                ? 'bg-accent text-slate-950 border-accent'
                : 'bg-slate-900 border-slate-700 text-slate-100'
            }`}
          >
            {d} days
          </button>
        ))}
      </div>

      <HealthBanner />
      <SummaryCards />

      {noItems ? (
        <div className="mt-6 rounded-2xl bg-card border border-slate-800 px-4 py-6 text-center">
          <p className="font-heading text-lg mb-1">Nothing due in this period 🎉</p>
          <p className="text-sm text-slate-300">
            You don&apos;t have any payments scheduled in this horizon. Enjoy the breather.
          </p>
        </div>
      ) : (
        <div className="mt-4">
          {renderGroup('Today', buckets.today, buckets.totals.today)}
          {renderGroup('Tomorrow', buckets.tomorrow, buckets.totals.tomorrow)}
          {renderGroup('This week', buckets.thisWeek, buckets.totals.thisWeek)}
          {renderGroup('Coming up', buckets.comingUp, buckets.totals.comingUp)}
        </div>
      )}
    </div>
  )
}

