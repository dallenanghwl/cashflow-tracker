import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { computeOccurrences } from '../lib/recurringUtils'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [payments, setPayments] = useState([])
  const [inflows, setInflows] = useState([])
  const [recurring, setRecurring] = useState([])
  const [settings, setSettings] = useState([])
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [horizonDays, setHorizonDays] = useState(14)
  const [toast, setToast] = useState(null)

  const openingBalance = useMemo(() => {
    const row = settings.find((s) => s.key === 'opening_balance')
    const val = row ? Number.parseFloat(row.value || '0') : 0
    return Number.isNaN(val) ? 0 : val
  }, [settings])

  const showToast = (message) => {
    setToast({ id: Date.now(), message })
    setTimeout(() => {
      setToast((current) => (current && current.id === message.id ? null : null))
    }, 2500)
  }

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [paymentsRes, inflowsRes, recurringRes, settingsRes] = await Promise.all([
        supabase.from('payments').select('*').order('due_date'),
        supabase.from('inflows').select('*').order('expected_date'),
        supabase.from('recurring').select('*').order('created_at'),
        supabase.from('settings').select('*'),
      ])

      if (paymentsRes.error) throw paymentsRes.error
      if (inflowsRes.error) throw inflowsRes.error
      if (recurringRes.error) throw recurringRes.error
      if (settingsRes.error) throw settingsRes.error

      setPayments(paymentsRes.data || [])
      setInflows(inflowsRes.data || [])
      setRecurring(recurringRes.data || [])
      setSettings(settingsRes.data || [])
    } catch (e) {
      console.error(e)
      setError('Something went wrong loading your data.')
    } finally {
      setLoading(false)
      setLoadingInitial(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const upcomingVirtualPayments = useMemo(
    () => computeOccurrences(recurring, payments, horizonDays),
    [recurring, payments, horizonDays],
  )

  const allOutflows = useMemo(
    () => [...payments, ...upcomingVirtualPayments],
    [payments, upcomingVirtualPayments],
  )

  const addPayment = async (payload) => {
    const optimistic = {
      ...payload,
      id: `temp-${Date.now()}`,
      status: payload.status || 'Pending',
    }
    setPayments((prev) => [...prev, optimistic])
    showToast('Payment saved')
    const { data, error: err } = await supabase.from('payments').insert(payload).select('*').single()
    if (err) {
      console.error(err)
      setPayments((prev) => prev.filter((p) => p.id !== optimistic.id))
      showToast('Could not save payment')
      return
    }
    setPayments((prev) => prev.map((p) => (p.id === optimistic.id ? data : p)))
  }

  const addInflow = async (payload) => {
    const optimistic = {
      ...payload,
      id: `temp-${Date.now()}`,
      status: payload.status || 'Expected',
    }
    setInflows((prev) => [...prev, optimistic])
    showToast('Income saved')
    const { data, error: err } = await supabase.from('inflows').insert(payload).select('*').single()
    if (err) {
      console.error(err)
      setInflows((prev) => prev.filter((p) => p.id !== optimistic.id))
      showToast('Could not save income')
      return
    }
    setInflows((prev) => prev.map((p) => (p.id === optimistic.id ? data : p)))
  }

  const addRecurring = async (payload) => {
    const optimistic = {
      ...payload,
      id: `temp-${Date.now()}`,
      active: true,
    }
    setRecurring((prev) => [...prev, optimistic])
    showToast('Recurring payment saved')
    const { data, error: err } = await supabase.from('recurring').insert(payload).select('*').single()
    if (err) {
      console.error(err)
      setRecurring((prev) => prev.filter((r) => r.id !== optimistic.id))
      showToast('Could not save recurring payment')
      return
    }
    setRecurring((prev) => prev.map((r) => (r.id === optimistic.id ? data : r)))
  }

  const toggleRecurringActive = async (recurringId, nextActive) => {
    setRecurring((prev) =>
      prev.map((r) => (r.id === recurringId ? { ...r, active: nextActive } : r)),
    )
    showToast(nextActive ? 'Recurring resumed' : 'Recurring paused')
    const { error: err } = await supabase
      .from('recurring')
      .update({ active: nextActive })
      .eq('id', recurringId)
    if (err) {
      console.error(err)
      setRecurring((prev) =>
        prev.map((r) => (r.id === recurringId ? { ...r, active: !nextActive } : r)),
      )
      showToast('Could not update recurring payment')
    }
  }

  const deleteRecurring = async (id) => {
    const prev = recurring
    setRecurring((r) => r.filter((x) => x.id !== id))
    showToast('Recurring deleted')
    const { error: err } = await supabase.from('recurring').delete().eq('id', id)
    if (err) {
      console.error(err)
      setRecurring(prev)
      showToast('Could not delete recurring')
    }
  }

  const markPaymentPaid = async (id) => {
    const prev = payments
    setPayments((list) => list.map((p) => (p.id === id ? { ...p, status: 'Paid' } : p)))
    showToast('Marked as paid')
    const { error: err } = await supabase.from('payments').update({ status: 'Paid' }).eq('id', id)
    if (err) {
      console.error(err)
      setPayments(prev)
      showToast('Could not mark as paid')
    }
  }

  const deletePayment = async (id) => {
    const prev = payments
    setPayments((list) => list.filter((p) => p.id !== id))
    showToast('Payment deleted')
    const { error: err } = await supabase.from('payments').delete().eq('id', id)
    if (err) {
      console.error(err)
      setPayments(prev)
      showToast('Could not delete payment')
    }
  }

  const markInflowReceived = async (id) => {
    const prev = inflows
    setInflows((list) => list.map((p) => (p.id === id ? { ...p, status: 'Received' } : p)))
    showToast('Marked as received')
    const { error: err } = await supabase.from('inflows').update({ status: 'Received' }).eq('id', id)
    if (err) {
      console.error(err)
      setInflows(prev)
      showToast('Could not mark as received')
    }
  }

  const saveOpeningBalance = async (value) => {
    const nextValue = String(value ?? '0')
    const prev = settings
    const existing = settings.find((s) => s.key === 'opening_balance')
    if (existing) {
      setSettings((all) => all.map((s) => (s.key === 'opening_balance' ? { ...s, value: nextValue } : s)))
      const { error: err } = await supabase
        .from('settings')
        .update({ value: nextValue })
        .eq('key', 'opening_balance')
      if (err) {
        console.error(err)
        setSettings(prev)
        showToast('Could not save opening balance')
        return
      }
    } else {
      const optimistic = { key: 'opening_balance', value: nextValue }
      setSettings((all) => [...all, optimistic])
      const { error: err } = await supabase.from('settings').insert(optimistic)
      if (err) {
        console.error(err)
        setSettings(prev)
        showToast('Could not save opening balance')
        return
      }
    }
    showToast('Opening balance saved')
  }

  const value = {
    payments,
    inflows,
    recurring,
    settings,
    loading,
    loadingInitial,
    error,
    horizonDays,
    setHorizonDays,
    openingBalance,
    upcomingVirtualPayments,
    allOutflows,
    addPayment,
    addInflow,
    addRecurring,
    toggleRecurringActive,
    deleteRecurring,
    markPaymentPaid,
    deletePayment,
    markInflowReceived,
    saveOpeningBalance,
    reload: loadAll,
    toast,
    showToast,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none">
          <div className="pointer-events-auto max-w-xs px-4 py-3 rounded-2xl bg-slate-900/95 text-sm shadow-lg border border-slate-700">
            {toast.message}
          </div>
        </div>
      )}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return ctx
}

