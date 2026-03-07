import { useMemo } from 'react'
import { useAppContext } from '../context/AppContext.jsx'

function simulateBalance(opening, payments, inflows, horizonDays) {
  const byDay = {}

  const add = (dateStr, delta) => {
    if (!byDay[dateStr]) byDay[dateStr] = 0
    byDay[dateStr] += delta
  }

  payments.forEach((p) => {
    if (!p.due_date) return
    add(p.due_date, -Number(p.amount || 0))
  })
  inflows.forEach((i) => {
    if (!i.expected_date) return
    add(i.expected_date, Number(i.amount || 0))
  })

  const today = new Date()
  const days = []
  for (let i = 0; i <= horizonDays; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    days.push(key)
  }

  let balance = opening
  let minBalance = opening
  let minDate = null

  days.forEach((d) => {
    if (byDay[d]) balance += byDay[d]
    if (balance < minBalance) {
      minBalance = balance
      minDate = d
    }
  })

  return { endBalance: balance, minBalance, minDate }
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function HealthBanner() {
  const { currentBalance, openingBalance, allOutflows, inflows, horizonDays } = useAppContext()

  const { status, message, endBalance } = useMemo(() => {
    const confirmedOutflows = allOutflows.filter((p) => p.status !== 'Paid')
    const confirmedInflows = inflows.filter((i) => i.status !== 'Received')
    const { endBalance, minBalance, minDate } = simulateBalance(
      currentBalance,
      confirmedOutflows,
      confirmedInflows,
      horizonDays,
    )

    const threshold = openingBalance * 0.15
    if (endBalance < 0) {
      const shortfallAmount = Math.abs(endBalance)
      return {
        status: 'danger',
        message: `You will be short by ${shortfallAmount.toLocaleString(undefined, { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 })}`,
        endBalance,
      }
    }
    if (endBalance < threshold) {
      return {
        status: 'warning',
        message: 'Getting tight — your balance will get close to empty in this period.',
        endBalance,
      }
    }
    return {
      status: 'ok',
      message: "You're all good — you can afford everything in this period.",
      endBalance,
    }
  }, [currentBalance, openingBalance, allOutflows, inflows, horizonDays])

  const colorClasses =
    status === 'danger'
      ? 'bg-red-900/40 border-red-500/70 text-red-50'
      : status === 'warning'
        ? 'bg-amber-900/40 border-amber-500/70 text-amber-50'
        : 'bg-emerald-900/40 border-emerald-500/70 text-emerald-50'

  const dotColor =
    status === 'danger' ? 'bg-red-400' : status === 'warning' ? 'bg-amber-300' : 'bg-emerald-300'

  return (
    <section
      aria-label="Cashflow health"
      className={`rounded-2xl border px-4 py-3 mb-4 flex items-start gap-3 ${colorClasses}`}
    >
      <span className={`mt-1 inline-block w-3 h-3 rounded-full ${dotColor}`} />
      <div className="space-y-1">
        <p className="font-heading text-base">{message}</p>
        <p className="text-sm text-slate-100/90">
          {status === 'danger' ? (
            <>At the end of this period your balance would be{' '}
              <span className="font-semibold text-red-200">
                {endBalance.toLocaleString(undefined, {
                  style: 'currency',
                  currency: 'SGD',
                  maximumFractionDigits: 0,
                })}
              </span>.
              </>
          ) : (
            <>You&apos;ll have{' '}
              <span className="font-semibold">
                {endBalance.toLocaleString(undefined, {
                  style: 'currency',
                  currency: 'SGD',
                  maximumFractionDigits: 0,
                })}
              </span>{' '}
              left at the end of this period.</>
          )}
        </p>
      </div>
    </section>
  )
}

