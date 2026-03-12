import { useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext.jsx'
import { PaymentCard } from '../components/PaymentCard.jsx'

const TABS = ['All', 'Pending', 'Paid']

export function History() {
  const {
    payments,
    updatePayment,
    deletePayment,
  } = useAppContext()
  const [tab, setTab] = useState('All')
  const [editing, setEditing] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)

  const openEdit = (item) => {
    setEditing(item)
    setEditAmount(String(item.amount ?? ''))
    setEditDate(item.due_date || '')
    setEditName(item.payee || '')
    setEditCategory(item.category || '')
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editing) return
    setEditSubmitting(true)
    await updatePayment(editing.id, {
      amount: Number(editAmount),
      due_date: editDate,
      payee: editName,
      category: editCategory || null,
    })
    setEditing(null)
    setEditSubmitting(false)
  }

  const items = useMemo(() => {
    const paymentItems = payments.map((p) => ({
      ...p,
      type: 'payment',
      date: p.due_date,
    }))
    let all = paymentItems.filter((x) => x.date)

    if (tab === 'Pending') {
      all = all.filter((x) => x.status !== 'Paid')
    } else if (tab === 'Paid') {
      all = all.filter((x) => x.status === 'Paid')
    }

    all.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    return all
  }, [payments, tab])

  return (
    <div>
      <h1 className="font-heading text-2xl mb-1">History</h1>
      <p className="text-sm text-slate-300 mb-3">
        See everything that&apos;s gone out and come in.
      </p>

      <div className="flex gap-1 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 min-h-[40px] rounded-full text-xs ${
              tab === t
                ? 'bg-accent text-slate-950 font-semibold'
                : 'bg-slate-900 text-slate-100 border border-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-card border border-slate-800 px-4 py-6 text-center">
          <p className="font-heading text-lg mb-1">No items yet</p>
          <p className="text-sm text-slate-300">
            As you add payments and income, they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`}>
              <div className="text-[11px] text-slate-400 mb-1">
                {new Date(item.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </div>
              <PaymentCard
                payment={item}
                asInflow={item.type === 'inflow'}
                showHistoryActions
                onEdit={() => openEdit(item)}
                onDelete={
                  item.type === 'payment'
                    ? () => deletePayment(item.id)
                    : () => deleteInflow(item.id)
                }
              />
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-heading text-lg mb-2">Edit payment</h2>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full rounded-2xl bg-slate-800 border border-slate-700 px-3 py-3 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full rounded-2xl bg-slate-800 border border-slate-700 px-3 py-3 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  {editing.type === 'inflow' ? 'Description' : 'Payee name'}
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-2xl bg-slate-800 border border-slate-700 px-3 py-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Category</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded-2xl bg-slate-800 border border-slate-700 px-3 py-3 text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 min-h-[48px] rounded-2xl border border-slate-600 text-slate-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 min-h-[48px] rounded-2xl bg-accent text-slate-950 font-semibold text-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

