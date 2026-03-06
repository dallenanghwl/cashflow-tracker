const addDays = (date, days) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const addFrequency = (date, frequency) => {
  const d = new Date(date)
  switch (frequency) {
    case 'Weekly':
      return addDays(d, 7)
    case 'Fortnightly':
      return addDays(d, 14)
    case 'Monthly':
      d.setMonth(d.getMonth() + 1)
      return d
    case 'Quarterly':
      d.setMonth(d.getMonth() + 3)
      return d
    case 'Yearly':
      d.setFullYear(d.getFullYear() + 1)
      return d
    default:
      return d
  }
}

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

export function computeOccurrences(recurringList, confirmedPayments, horizonDays = 14) {
  const now = new Date()
  const horizonDate = addDays(now, horizonDays)

  const confirmedKeys = new Set(
    confirmedPayments
      .filter((p) => p.recurring_id && p.due_date)
      .map((p) => `${p.recurring_id}-${p.due_date}`),
  )

  const occurrences = []

  for (const r of recurringList || []) {
    if (!r.active) continue

    let cursor = new Date(r.start_date)
    const endDate = r.end_date ? new Date(r.end_date) : null

    while (cursor <= horizonDate) {
      if (cursor >= now) {
        if (!endDate || cursor <= endDate) {
          const key = `${r.id}-${cursor.toISOString().slice(0, 10)}`
          if (!confirmedKeys.has(key)) {
            const dueDateStr = cursor.toISOString().slice(0, 10)
            occurrences.push({
              id: `virtual-${r.id}-${dueDateStr}`,
              payee: r.payee,
              amount: r.amount,
              invoice_date: dueDateStr,
              due_date: dueDateStr,
              terms: null,
              category: r.category,
              status: 'Pending',
              notes: r.notes,
              recurring_id: r.id,
              created_at: new Date().toISOString(),
              virtual: true,
            })
          }
        }
      }

      cursor = addFrequency(cursor, r.frequency)

      if (r.day_of_month && ['Monthly', 'Quarterly', 'Yearly'].includes(r.frequency)) {
        const day = r.day_of_month
        cursor.setDate(Math.min(day, 28))
      }

      if (endDate && cursor > endDate) break
      if (cursor > addDays(now, horizonDays + 365)) break
    }
  }

  return occurrences.sort((a, b) => (a.due_date < b.due_date ? -1 : 1))
}

