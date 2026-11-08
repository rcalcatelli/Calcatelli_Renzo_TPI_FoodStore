import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

// Reúne la Navbar y el contenido de la ruta
export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
