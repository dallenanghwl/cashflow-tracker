import { useMemo } from 'react'
import { useAppContext } from '../context/AppContext.jsx'

function withinDays(dateStr, days) {
  if (!dateStr) return false
  const today = new Date()
  const target = new Date(dateStr)
  const diff = (target.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= days
}

export function SummaryCards({ scope = 'week', scopeDays = 7 }) {
  const { currentBalance, allOutflows, horizonDays } = useAppContext()
  const todayStr = new Date().toISOString().slice(0, 10)

  const { outScope, endBalance } = useMemo(() => {
    const tomorrowStr = new Date(new Date(todayStr).getTime() + 86400000).toISOString().slice(0, 10)

    const outScope = allOutflows
      .filter((p) => {
        if (p.status === 'Paid') return false
        const d = p.due_date
        if (!d) return false
        return withinDays(d, scopeDays)
      })
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    const totalOutInHorizon = allOutflows
      .filter((p) => p.status !== 'Paid' && withinDays(p.due_date, horizonDays))
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    const endBalance = currentBalance - totalOutInHorizon

    return { outScope, endBalance }
  }, [currentBalance, allOutflows, horizonDays, scopeDays, todayStr])

  const format = (n) =>
    n.toLocaleString(undefined, {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    })

  const scopeBalanceLabel = `After ${scopeDays} days`
  const scopeOutLabel =
    scope === 'today'
      ? 'Going out today'
      : scope === 'tomorrow'
        ? 'Going out tomorrow'
        : `Going out (next ${scopeDays} days)`

  return (
    <section className="grid grid-cols-2 gap-3 mb-5">
      <article className="rounded-2xl bg-card px-4 py-3 border border-slate-800">
        <p className="text-xs text-slate-300 mb-1">{scopeBalanceLabel}</p>
        <p
          className={`font-heading text-2xl ${
            endBalance < 0 ? 'text-red-400' : ''
          }`}
        >
          {format(endBalance)}
        </p>
      </article>
      <article className="rounded-2xl bg-card px-4 py-3 border border-slate-800">
        <p className="text-xs text-slate-300 mb-1">{scopeOutLabel}</p>
        <p className="font-heading text-2xl text-red-400">-{format(outScope)}</p>
      </article>
    </section>
  )
}

