import { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext.jsx'

export function Settings() {
  const { openingBalance, saveOpeningBalance } = useAppContext()
  const [value, setValue] = useState(openingBalance.toString())

  useEffect(() => {
    setValue(openingBalance.toString())
  }, [openingBalance])
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const num = Number(value || 0)
    setSaving(true)
    await saveOpeningBalance(num)
    setSaving(false)
  }

  return (
    <div>
      <h1 className="font-heading text-2xl mb-1">Settings</h1>
      <p className="text-sm text-slate-300 mb-4">
        Set your opening balance — the starting point for your calculated current balance.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Opening balance</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-2xl bg-slate-900 border border-slate-700 px-3 py-3 text-lg font-heading"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full min-h-[48px] rounded-2xl bg-accent text-slate-950 font-semibold text-sm mt-2"
        >
          Save balance
        </button>
      </form>

      <p className="text-[11px] text-slate-400 mt-3">
        Current balance = opening + received inflows − paid payments. It updates when you mark items paid or add cash sales.
      </p>
    </div>
  )
}

