import { NavLink, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Overview' },
  { to: '/add-payment', label: '+ Payment' },
  { to: '/add-inflow', label: '+ Receive' },
  { to: '/recurring', label: 'Recurring' },
  { to: '/history', label: 'More' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-md">
      <div className="max-w-md mx-auto flex justify-between gap-1 px-2 py-2">
        {tabs.map((tab) => {
          const isActive =
            tab.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.to)

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`flex-1 flex flex-col items-center justify-center px-1 py-2 rounded-xl text-[13px] leading-tight min-h-[48px] ${
                isActive
                  ? 'bg-accent/20 text-accent font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70'
              }`}
            >
              <span>{tab.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

