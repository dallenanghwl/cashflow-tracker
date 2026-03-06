import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'

export function AddInflow() {
  const navigate = useNavigate()
  const { addInflow } = useAppContext()
  const today = new Date().toISOString().slice(0, 10)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [expectedDate, setExpectedDate] = useState(today)
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!description || !amount || !expectedDate) return
    setSubmitting(true)
    await addInflow({
      description,
      amount: Number(amount),
      expected_date: expectedDate,
      category,
      notes,
    })
    navigate('/')
  }

  return (
    <div>
      <h1 className="font-heading text-2xl mb-1">Add income</h1>
      <p className="text-sm text-slate-300 mb-4">
        Record money you expect to receive.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
          <label className="block text-sm mb-1">Expected date</label>
          <input
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
            className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm"
            placeholder="Client, product, other..."
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
          Save income
        </button>
      </form>
    </div>
  )
}

