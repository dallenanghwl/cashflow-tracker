import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'

const FREQUENCIES = ['Weekly', 'Fortnightly', 'Monthly', 'Quarterly', 'Yearly']

export function AddRecurring() {
  const navigate = useNavigate()
  const { id: editId } = useParams()
  const { addRecurring, updateRecurring, recurring } = useAppContext()
  const today = new Date().toISOString().slice(0, 10)

  const [payee, setPayee] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState('Monthly')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState('')
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isEdit = Boolean(editId)
  const existing = isEdit ? recurring.find((r) => r.id === editId) : null

  useEffect(() => {
    if (!editId || !recurring.length) return
    const rec = recurring.find((r) => r.id === editId)
    if (rec) {
      setPayee(rec.payee || '')
      setAmount(String(rec.amount ?? ''))
      setFrequency(rec.frequency || 'Monthly')
      setDayOfMonth(rec.day_of_month ? String(rec.day_of_month) : '1')
      setStartDate(rec.start_date || today)
      setEndDate(rec.end_date || '')
      setCategory(rec.category || '')
      setNotes(rec.notes || '')
    }
  }, [editId, recurring])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!payee || !amount || !frequency || !startDate) return
    setSubmitting(true)
    const payload = {
      payee,
      amount: Number(amount),
      category: category || null,
      frequency,
      start_date: startDate,
      end_date: endDate || null,
      day_of_month:
        ['Monthly', 'Quarterly', 'Yearly'].includes(frequency) && dayOfMonth
          ? Number(dayOfMonth)
          : null,
      notes: notes || null,
    }
    if (isEdit) {
      await updateRecurring(editId, payload)
    } else {
      await addRecurring({ ...payload, active: true })
    }
    navigate('/recurring')
  }

  const needsDayOfMonth = ['Monthly', 'Quarterly', 'Yearly'].includes(frequency)

  return (
    <div>
      <h1 className="font-heading text-2xl mb-1">
        {isEdit ? 'Edit recurring payment' : 'Add recurring payment'}
      </h1>
      <p className="text-sm text-slate-300 mb-4">
        {isEdit
          ? 'Update the details below.'
          : 'Set up regular payments like rent, software, or wages.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Name / Payee</label>
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
          <label className="block text-sm mb-1">Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {needsDayOfMonth && (
          <div>
            <label className="block text-sm mb-1">Day of month</label>
            <input
              type="number"
              min="1"
              max="28"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Always charge on this day (we cap at 28 to avoid short months).
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">End date (optional)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Leave blank if ongoing.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[48px] rounded-2xl bg-accent text-slate-950 font-semibold text-sm mt-2"
        >
          {isEdit ? 'Update recurring payment' : 'Save recurring payment'}
        </button>
      </form>
    </div>
  )
}

