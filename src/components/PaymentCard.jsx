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

function PaymentStatusBadge({ payment, asInflow }) {
  const isPaid = payment.status === 'Paid'
  const instructionSent = payment.instruction_sent === true

  if (isPaid) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-100">
        🟢 Paid
      </span>
    )
  }
  if (instructionSent) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-900/80 text-indigo-100">
        🔵 Instruction sent
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-900/80 text-amber-100">
      🔴 Instruction not sent
    </span>
  )
}

export function PaymentCard({
  payment,
  onEdit,
  onDelete,
  showHistoryActions = false,
}) {
  const {
    markPaymentPaid,
    markInstructionSent,
    deletePayment,
    markPaymentPending,
  } = useAppContext()

  const label = useMemo(() => friendlyDateLabel(payment.due_date), [payment])

  const amount = Number(payment.amount || 0)
  const isPaid = payment.status === 'Paid'
  const isVirtual = payment.virtual === true

  const handleMarkPaid = () => {
    if (isPaid) return
    markPaymentPaid(payment.id)
  }

  const handleMarkInstructionSent = () => {
    if (!isVirtual) markInstructionSent(payment.id)
  }

  const handleDelete = () => {
    if (onDelete) onDelete()
    else if (!isVirtual) deletePayment(payment.id)
  }

  const showInstructionButton =
    !isPaid && !isVirtual && payment.instruction_sent !== true

  return (
    <article className="rounded-2xl bg-card border border-slate-800 px-4 py-3 mb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-heading text-lg leading-tight">
            {payment.payee}
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
            <PaymentStatusBadge payment={payment} asInflow={asInflow} />
          </div>
        </div>
        <p
          className={`font-heading text-2xl ${
            'text-red-400'
          }`}
        >
          -
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
            {(onDelete || !isVirtual) && (
              <button
                type="button"
                onClick={handleDelete}
                className="min-h-[48px] rounded-2xl border border-slate-700 text-xs text-slate-200 px-4"
              >
                Delete
              </button>
            )}
            {payment.status === 'Paid' && (
              <button
                type="button"
                onClick={() => markPaymentPending(payment.id)}
                className="min-h-[48px] rounded-2xl bg-slate-700 text-slate-100 text-xs font-semibold px-4 border border-slate-500"
              >
                Mark as unpaid
              </button>
            )}
          </>
        ) : (
          <>
            {!isPaid && (
              <>
                {showInstructionButton && (
                  <button
                    type="button"
                    onClick={handleMarkInstructionSent}
                    className="min-h-[48px] rounded-2xl bg-slate-700 text-slate-100 text-sm font-semibold px-4 border border-slate-600"
                  >
                    Mark instruction sent
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleMarkPaid}
                  className="flex-1 min-h-[48px] rounded-2xl bg-emerald-500 text-slate-950 text-sm font-semibold active:scale-[0.99]"
                >
                  Mark as paid
                </button>
              </>
            )}
            {!isVirtual && (
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
