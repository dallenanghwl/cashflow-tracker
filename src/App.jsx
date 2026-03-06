import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Overview } from './pages/Overview.jsx'
import { AddPayment } from './pages/AddPayment.jsx'
import { AddInflow } from './pages/AddInflow.jsx'
import { AddRecurring } from './pages/AddRecurring.jsx'
import { ManageRecurring } from './pages/ManageRecurring.jsx'
import { History } from './pages/History.jsx'
import { Settings } from './pages/Settings.jsx'
import { BottomNav } from './components/BottomNav.jsx'
import { useAppContext } from './context/AppContext.jsx'
import { SkeletonLoader } from './components/SkeletonLoader.jsx'

function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-page text-slate-50">
      <main className="flex-1 pb-20 max-w-md mx-auto w-full px-4 pt-4">{children}</main>
      <BottomNav />
    </div>
  )
}

function App() {
  const { loadingInitial } = useAppContext()

  if (loadingInitial) {
    return (
      <AppShell>
        <div className="space-y-3">
          <SkeletonLoader variant="banner" />
          <SkeletonLoader variant="summary" />
          <SkeletonLoader variant="list" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/add-payment" element={<AddPayment />} />
        <Route path="/add-inflow" element={<AddInflow />} />
        <Route path="/add-recurring" element={<AddRecurring />} />
        <Route path="/recurring" element={<ManageRecurring />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default App
