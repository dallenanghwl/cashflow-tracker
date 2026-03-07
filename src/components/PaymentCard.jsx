import { useMemo } from 'react'
import { useAppContext } from '../context/AppContext.jsx'

function friendlyDateLabel(dateStr) {
  if (!dateStr) return ''
  const today = new Date()
  const date = new Date(dateStr)
  const diffDays = Math.round(
    (date.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24),
  )

  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  if (diffDays > 1) {
    return `Due ${date.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })}`
  }

  const abs = Math.abs(diffDays)
  if (abs === 1) return '1 day overdue'
  return `${abs} days overdue`
}

export function PaymentCard({
  payment,
  asInflow = false,
  onEdit,
  onDelete,
  showHistoryActions = false,
}) {
  const { markPaymentPaid, deletePayment, markInflowReceived } = useAppContext()

  const label = useMemo(() => friendlyDateLabel(payment.due_date || payment.expected_date), [payment])

  const amount = Number(payment.amount || 0)
  const isPaid = payment.status === 'Paid' || payment.status === 'Received'

  const handlePrimary = () => {
    if (isPaid) return
    if (asInflow) markInflowReceived(payment.id)
    else markPaymentPaid(payment.id)
  }

  const handleDelete = () => {
    if (onDelete) onDelete()
    else if (!asInflow) deletePayment(payment.id)
  }

  return (
    <article className="rounded-2xl bg-card border border-slate-800 px-4 py-3 mb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-heading text-lg leading-tight">
            {asInflow ? payment.description : payment.payee}
          </p>
          <p className="text-xs text-slate-300">{label}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {payment.category && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-100">
                {payment.category}
              </span>
            )}
            {payment.recurring_id && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-900/70 text-indigo-100">
                ↻ Recurring
              </span>
            )}
            {isPaid && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-100">
                {asInflow ? 'Received' : 'Paid'}
              </span>
            )}
          </div>
        </div>
        <p
          className={`font-heading text-2xl ${
            asInflow ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {asInflow ? '+' : '-'}
          {amount.toLocaleString(undefined, {
            style: 'currency',
            currency: 'SGD',
            maximumFractionDigits: 0,
          })}
        </p>
      </div>

      <div className="mt-3 flex gap-2 flex-wrap">
        {showHistoryActions ? (
          <>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="min-h-[48px] rounded-2xl border border-slate-600 text-slate-200 text-sm font-semibold px-4"
              >
                Edit
              </button>
            )}
            {(onDelete || !asInflow) && (
              <button
                type="button"
                onClick={handleDelete}
                className="min-h-[48px] rounded-2xl border border-slate-700 text-xs text-slate-200 px-4"
              >
                Delete
              </button>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handlePrimary}
              disabled={isPaid}
              className={`flex-1 min-h-[48px] rounded-2xl text-sm font-semibold ${
                isPaid
                  ? 'bg-slate-700 text-slate-300 cursor-default'
                  : 'bg-emerald-500 text-slate-950 active:scale-[0.99]'
              }`}
            >
              {asInflow ? '✓ Mark as received' : '✓ Mark as paid'}
            </button>
            {(onDelete || !asInflow) && (
              <button
                type="button"
                onClick={handleDelete}
                className="min-w-[80px] min-h-[48px] rounded-2xl border border-slate-700 text-xs text-slate-200"
              >
                Delete
              </button>
            )}
          </>
        )}
      </div>
    </article>
  )
}

