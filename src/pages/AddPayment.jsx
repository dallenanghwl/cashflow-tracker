import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'

const TERMS = [
  'COD',
  'Net 7',
  'Net 14',
  'Net 30',
  'Net 45',
  'Net 60',
  'Custom days',
]

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function calculateDueDate(invoiceDate, terms, customDays) {
  if (!invoiceDate) return ''
  switch (terms) {
    case 'COD':
      return invoiceDate
    case 'Net 7':
      return addDays(invoiceDate, 7)
    case 'Net 14':
      return addDays(invoiceDate, 14)
    case 'Net 30':
      return addDays(invoiceDate, 30)
    case 'Net 45':
      return addDays(invoiceDate, 45)
    case 'Net 60':
      return addDays(invoiceDate, 60)
    case 'Custom days':
      return addDays(invoiceDate, Number(customDays || 0))
    default:
      return invoiceDate
  }
}

export function AddPayment() {
  const navigate = useNavigate()
  const { addPayment } = useAppContext()
  const today = new Date().toISOString().slice(0, 10)

  const [payee, setPayee] = useState('')
  const [amount, setAmount] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(today)
  const [terms, setTerms] = useState('Net 14')
  const [customDays, setCustomDays] = useState('')
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const dueDate = calculateDueDate(invoiceDate, terms, customDays)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!payee || !amount || !dueDate) return
    setSubmitting(true)
    await addPayment({
      payee,
      amount: Number(amount),
      invoice_date: invoiceDate,
      due_date: dueDate,
      terms,
      category,
      notes,
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Invoice date</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Due date</label>
            <input
              type="date"
              value={dueDate}
              readOnly
              className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm text-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Payment terms</label>
          <select
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
          >
            {TERMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {terms === 'Custom days' && (
          <div>
            <label className="block text-sm mb-1">Custom days from invoice</label>
            <input
              type="number"
              min="0"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-sm mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
            placeholder="Rent, software, wages..."
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
          Save payment
        </button>
      </form>
    </div>
  )
}

