import { useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext.jsx'
import { PaymentCard } from '../components/PaymentCard.jsx'

const TABS = ['All', 'Pending', 'Paid', 'Inflows']

export function History() {
  const { payments, inflows } = useAppContext()
  const [tab, setTab] = useState('All')

  const items = useMemo(() => {
    const paymentItems = payments.map((p) => ({
      ...p,
      type: 'payment',
      date: p.due_date || p.invoice_date,
    }))
    const inflowItems = inflows.map((i) => ({
      ...i,
      type: 'inflow',
      date: i.expected_date,
    }))

    let all = [...paymentItems, ...inflowItems].filter((x) => x.date)

    if (tab === 'Pending') {
      all = all.filter(
        (x) =>
          (x.type === 'payment' && x.status !== 'Paid') ||
          (x.type === 'inflow' && x.status !== 'Received'),
      )
    } else if (tab === 'Paid') {
      all = all.filter((x) => x.status === 'Paid' || x.status === 'Received')
    } else if (tab === 'Inflows') {
      all = all.filter((x) => x.type === 'inflow')
    }

    all.sort((a, b) => (a.date < b.date ? 1 : -1))
    return all
  }, [payments, inflows, tab])

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
              <PaymentCard payment={item} asInflow={item.type === 'inflow'} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

