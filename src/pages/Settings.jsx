import { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext.jsx'

export function Settings() {
  const { openingBalance } = useAppContext()
  return (
    <div>
      <h1 className="font-heading text-2xl mb-1">Settings</h1>
      <p className="text-sm text-slate-300 mb-4">
        Your bank balance is updated directly on the Overview screen.
      </p>
      <p className="text-[11px] text-slate-400 mt-3">
        Current balance starts from your bank balance and goes down as you mark payments paid.
      </p>
    </div>
  )
}

