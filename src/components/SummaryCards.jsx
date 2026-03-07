import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'

function withinDays(dateStr, days) {
  if (!dateStr) return false
  const today = new Date()
  const target = new Date(dateStr)
  const diff = (target.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= days
}

export function SummaryCards({ scope = 'week', scopeDays = 7 }) {
  const { openingBalance, payments, inflows, allOutflows, horizonDays } = useAppContext()
  const todayStr = new Date().toISOString().slice(0, 10)

  const { outScope, inScope, endBalance } = useMemo(() => {
    const tomorrowStr = new Date(new Date(todayStr).getTime() + 86400000).toISOString().slice(0, 10)

    const outFilter = (p) => {
      if (p.status === 'Paid') return false
      const d = p.due_date
      if (!d) return false
      if (scope === 'today') return d === todayStr
      if (scope === 'tomorrow') return d === tomorrowStr
      return withinDays(d, scopeDays)
    }
    const inFilter = (i) => {
      if (i.status === 'Received') return false
      const d = i.expected_date
      if (!d) return false
      if (scope === 'today') return d === todayStr
      if (scope === 'tomorrow') return d === tomorrowStr
      return withinDays(d, scopeDays)
    }

    const outScope = allOutflows
      .filter(outFilter)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const inScope = inflows
      .filter(inFilter)
      .reduce((sum, i) => sum + Number(i.amount || 0), 0)

    const endBalance =
      openingBalance -
      allOutflows
        .filter((p) => p.status !== 'Paid' && withinDays(p.due_date, horizonDays))
        .reduce((sum, p) => sum + Number(p.amount || 0), 0) +
      inflows
        .filter((i) => i.status !== 'Received' && withinDays(i.expected_date, horizonDays))
        .reduce((sum, i) => sum + Number(i.amount || 0), 0)

    return { outScope, inScope, endBalance }
  }, [openingBalance, inflows, allOutflows, horizonDays, scope, scopeDays, todayStr])

  const format = (n) =>
    n.toLocaleString(undefined, {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    })

  const scopeBalanceLabel =
    scope === 'today'
      ? "Today's balance"
      : scope === 'tomorrow'
        ? "Tomorrow's balance"
        : `After ${scopeDays} days`
  const scopeOutLabel =
    scope === 'today'
      ? 'Going out today'
      : scope === 'tomorrow'
        ? 'Going out tomorrow'
        : `Going out (next ${scopeDays} days)`
  const scopeInLabel =
    scope === 'today'
      ? 'Coming in today'
      : scope === 'tomorrow'
        ? 'Coming in tomorrow'
        : `Coming in (next ${scopeDays} days)`

  return (
    <section className="grid grid-cols-2 gap-3 mb-5">
      <Link
        to="/settings"
        className="rounded-2xl bg-card px-4 py-4 border border-slate-800 block col-span-2 focus:outline-none focus:ring-2 focus:ring-accent/50"
      >
        <p className="text-xs text-slate-300 mb-1">Money you have now</p>
        <p className="font-heading text-4xl tracking-tight">{format(openingBalance)}</p>
        <p className="text-[11px] text-slate-400 mt-1.5">Tap to update</p>
      </Link>
      <article className="rounded-2xl bg-card px-4 py-3 border border-slate-800">
        <p className="text-xs text-slate-300 mb-1">{scopeBalanceLabel}</p>
        <p className="font-heading text-2xl">
          {format(openingBalance - outScope + inScope)}
        </p>
      </article>
      <article className="rounded-2xl bg-card px-4 py-3 border border-slate-800">
        <p className="text-xs text-slate-300 mb-1">{scopeOutLabel}</p>
        <p className="font-heading text-2xl text-red-400">-{format(outScope)}</p>
      </article>
      <article className="rounded-2xl bg-card px-4 py-3 border border-slate-800">
        <p className="text-xs text-slate-300 mb-1">{scopeInLabel}</p>
        <p className="font-heading text-2xl text-emerald-400">{format(inScope)}</p>
      </article>
    </section>
  )
}

