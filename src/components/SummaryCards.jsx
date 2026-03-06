import { useMemo } from 'react'
import { useAppContext } from '../context/AppContext.jsx'

function withinDays(dateStr, days) {
  if (!dateStr) return false
  const today = new Date()
  const target = new Date(dateStr)
  const diff = (target.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= days
}

export function SummaryCards() {
  const { openingBalance, payments, inflows, horizonDays } = useAppContext()

  const { outThisWeek, inThisWeek, endBalance } = useMemo(() => {
    const out7 = payments
      .filter((p) => p.status !== 'Paid' && withinDays(p.due_date, 7))
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const in7 = inflows
      .filter((i) => i.status !== 'Received' && withinDays(i.expected_date, 7))
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    const endBalance =
      openingBalance -
      payments
        .filter((p) => p.status !== 'Paid' && withinDays(p.due_date, horizonDays))
        .reduce((sum, p) => sum + Number(p.amount || 0), 0) +
      inflows
        .filter((i) => i.status !== 'Received' && withinDays(i.expected_date, horizonDays))
        .reduce((sum, i) => sum + Number(i.amount || 0), 0)

    return { outThisWeek: out7, inThisWeek: in7, endBalance }
  }, [openingBalance, payments, inflows, horizonDays])

  const format = (n) =>
    n.toLocaleString(undefined, {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    })

  return (
    <section className="grid grid-cols-2 gap-3 mb-5">
      <article className="rounded-2xl bg-card px-4 py-3 border border-slate-800">
        <p className="text-xs text-slate-300 mb-1">Money you have now</p>
        <p className="font-heading text-2xl">{format(openingBalance)}</p>
      </article>
      <article className="rounded-2xl bg-card px-4 py-3 border border-slate-800">
        <p className="text-xs text-slate-300 mb-1">After {horizonDays} days</p>
        <p className="font-heading text-2xl">{format(endBalance)}</p>
      </article>
      <article className="rounded-2xl bg-card px-4 py-3 border border-slate-800">
        <p className="text-xs text-slate-300 mb-1">Going out this week</p>
        <p className="font-heading text-2xl text-red-400">-{format(outThisWeek)}</p>
      </article>
      <article className="rounded-2xl bg-card px-4 py-3 border border-slate-800">
        <p className="text-xs text-slate-300 mb-1">Coming in this week</p>
        <p className="font-heading text-2xl text-emerald-400">{format(inThisWeek)}</p>
      </article>
    </section>
  )
}

