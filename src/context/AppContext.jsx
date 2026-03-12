import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { computeOccurrences } from '../lib/recurringUtils'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [payments, setPayments] = useState([])
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

  const currentBalance = useMemo(() => {
    const paid = payments
      .filter((p) => p.status === 'Paid')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)
    return openingBalance - paid
  }, [openingBalance, payments])

  const showToast = (options) => {
    const id = Date.now()
    const payload =
      typeof options === 'string'
        ? { id, message: options }
        : { id, durationMs: 2500, ...options }
    setToast(payload)
    setTimeout(() => {
      setToast((current) => (current && current.id === id ? null : current))
    }, payload.durationMs)
  }

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [paymentsRes, recurringRes, settingsRes] = await Promise.all([
        supabase.from('payments').select('*').order('due_date'),
        supabase.from('recurring').select('*').order('created_at'),
        supabase.from('settings').select('*'),
      ])

      if (paymentsRes.error) throw paymentsRes.error
      if (recurringRes.error) throw recurringRes.error
      if (settingsRes.error) throw settingsRes.error

      setPayments(paymentsRes.data || [])
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
    const id = 'P' + Date.now()
    const insertPayload = {
      id,
      payee: payload.payee,
      amount: payload.amount,
      due_date: payload.due_date,
      category: payload.category ?? null,
      status: 'Pending',
      instruction_sent: payload.instruction_sent ?? false,
      recurring_id: null,
    }
    const optimistic = { ...insertPayload }
    setPayments((prev) => [...prev, optimistic])
    showToast('Payment saved')
    const { data, error: err } = await supabase.from('payments').insert(insertPayload).select('*').single()
    if (err) {
      console.error('[Supabase payments insert]', {
        message: err.message,
        code: err.code,
        details: err.details,
        fullError: err,
      })
      setPayments((prev) => prev.filter((p) => p.id !== id))
      showToast('Could not save payment')
      return
    }
    setPayments((prev) => prev.map((p) => (p.id === id ? data : p)))
  }

  const addRecurring = async (payload) => {
    const id = 'R' + Date.now()
    const insertPayload = {
      id,
      payee: payload.payee,
      amount: payload.amount,
      category: payload.category ?? null,
      frequency: payload.frequency,
      start_date: payload.start_date,
      end_date: payload.end_date ?? null,
      day_of_month: payload.day_of_month ?? null,
      active: payload.active ?? true,
    }
    const optimistic = { ...insertPayload }
    setRecurring((prev) => [...prev, optimistic])
    showToast('Recurring payment saved')
    const { data, error: err } = await supabase.from('recurring').insert(insertPayload).select('*').single()
    if (err) {
      console.error('[Supabase recurring insert]', {
        message: err.message,
        code: err.code,
        details: err.details,
        fullError: err,
      })
      setRecurring((prev) => prev.filter((r) => r.id !== id))
      showToast('Could not save recurring payment')
      return
    }
    setRecurring((prev) => prev.map((r) => (r.id === id ? data : r)))
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

  const updateRecurring = async (id, payload) => {
    const prevRow = recurring.find((r) => r.id === id)
    setRecurring((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...payload } : r)),
    )
    showToast('Recurring updated')
    const { error: err } = await supabase
      .from('recurring')
      .update({
        payee: payload.payee,
        amount: payload.amount,
        category: payload.category ?? null,
        frequency: payload.frequency,
        start_date: payload.start_date,
        end_date: payload.end_date ?? null,
        day_of_month: payload.day_of_month ?? null,
      })
      .eq('id', id)
    if (err) {
      console.error(err)
      setRecurring((prev) => prev.map((r) => (r.id === id ? prevRow : r)))
      showToast('Could not update recurring')
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

  const markPaymentPending = async (id) => {
    const prev = payments
    setPayments((list) =>
      list.map((p) => (p.id === id ? { ...p, status: 'Pending' } : p)),
    )
    const { error: err } = await supabase
      .from('payments')
      .update({ status: 'Pending' })
      .eq('id', id)
    if (err) {
      console.error(err)
      setPayments(prev)
      showToast('Could not revert payment')
    }
  }

  const markPaymentPaid = async (id) => {
    const prev = payments
    setPayments((list) => list.map((p) => (p.id === id ? { ...p, status: 'Paid' } : p)))
    showToast({
      message: 'Payment marked as paid',
      actionLabel: 'UNDO',
      durationMs: 10000,
      onAction: () => {
        markPaymentPending(id)
      },
    })
    const { error: err } = await supabase.from('payments').update({ status: 'Paid' }).eq('id', id)
    if (err) {
      console.error(err)
      setPayments(prev)
      showToast('Could not mark as paid')
    }
  }

  const markInstructionSent = async (id) => {
    const prev = payments
    setPayments((list) =>
      list.map((p) => (p.id === id ? { ...p, instruction_sent: true } : p)),
    )
    showToast('Instruction marked as sent')
    const { error: err } = await supabase
      .from('payments')
      .update({ instruction_sent: true })
      .eq('id', id)
    if (err) {
      console.error(err)
      setPayments(prev)
      showToast('Could not update')
    }
  }

  const updatePayment = async (id, payload) => {
    const prev = payments
    const allowed = ['payee', 'amount', 'due_date', 'category', 'instruction_sent', 'recurring_id']
    const updatePayload = Object.fromEntries(
      Object.entries(payload).filter(([k]) => allowed.includes(k)),
    )
    setPayments((list) =>
      list.map((p) => (p.id === id ? { ...p, ...updatePayload } : p)),
    )
    showToast('Payment updated')
    const { error: err } = await supabase
      .from('payments')
      .update(updatePayload)
      .eq('id', id)
    if (err) {
      console.error(err)
      setPayments(prev)
      showToast('Could not update payment')
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

  const saveOpeningBalance = async (value) => {
    const nextValue = String(value ?? '0')
    const prev = settings
    const existing = settings.find((s) => s.key === 'opening_balance')
    if (existing) {
      setSettings((all) =>
        all.map((s) =>
          s.key === 'opening_balance' ? { ...s, value: nextValue } : s,
        ),
      )
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
    // Record last-updated time for bank balance
    const timestamp = new Date().toISOString()
    const existingUpdatedAt = settings.find((s) => s.key === 'opening_balance_updated_at')
    if (existingUpdatedAt) {
      setSettings((all) =>
        all.map((s) =>
          s.key === 'opening_balance_updated_at' ? { ...s, value: timestamp } : s,
        ),
      )
      await supabase
        .from('settings')
        .update({ value: timestamp })
        .eq('key', 'opening_balance_updated_at')
    } else {
      const optimistic = { key: 'opening_balance_updated_at', value: timestamp }
      setSettings((all) => [...all, optimistic])
      await supabase.from('settings').insert(optimistic)
    }

    showToast('Bank balance saved')
  }

  const value = {
    payments,
    recurring,
    settings,
    loading,
    loadingInitial,
    error,
    horizonDays,
    setHorizonDays,
    openingBalance,
    currentBalance,
    upcomingVirtualPayments,
    allOutflows,
    addPayment,
    addRecurring,
    updateRecurring,
    toggleRecurringActive,
    deleteRecurring,
    markPaymentPaid,
    markInstructionSent,
    updatePayment,
    deletePayment,
    saveOpeningBalance,
    markPaymentPending,
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

