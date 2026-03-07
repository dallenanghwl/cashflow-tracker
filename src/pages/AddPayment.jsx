import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'

const CATEGORIES = [
  'Bills',
  'Rent',
  'Supplies',
  'Software',
  'Wages',
  'Marketing',
  'Other',
]

export function AddPayment() {
  const navigate = useNavigate()
  const { addPayment } = useAppContext()
  const today = new Date().toISOString().slice(0, 10)

  const [payee, setPayee] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState(today)
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [instructionSent, setInstructionSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!payee || !amount || !dueDate) return
    setSubmitting(true)
    await addPayment({
      payee,
      amount: Number(amount),
      due_date: dueDate,
      category: category || null,
      notes: notes || null,
      instruction_sent: instructionSent,
    })
    navigate('/')
  }

  return (
    <div>
      <h1 className="font-heading text-2xl mb-1">Add payment</h1>
      <p className="text-sm text-slate-300 mb-4">
        Record a one-off payment you need to make.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Payee name</label>
          <input
            type="text"
            value={payee}
            onChange={(e) => setPayee(e.target.value)}
            className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Due date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
          >
            <option value="">Select...</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
            placeholder="One line"
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer mt-4">
          <input
            type="checkbox"
            checked={instructionSent}
            onChange={(e) => setInstructionSent(e.target.checked)}
            className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-accent focus:ring-accent"
          />
          <span className="text-sm text-slate-200">
            Payment instruction sent (e.g. PayNow / Bank Transfer)
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[48px] rounded-2xl bg-accent text-slate-950 font-semibold text-sm mt-2"
        >
          Save payment
        </button>
      </form>
    </div>
  )
}
