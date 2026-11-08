import { NavLink, Outlet } from 'react-router-dom'

const SECCIONES = [
  { to: '/admin/resumen', texto: 'Resumen' },
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/productos', texto: 'Productos' },
  { to: '/admin/categorias', texto: 'Categorías' },
  { to: '/admin/usuarios', texto: 'Usuarios' },
]

// Pestañas del panel de administración
export function AdminLayout() {
  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Panel de administración" className="flex flex-wrap gap-1 border-b border-slate-200">
        {SECCIONES.map(({ to, texto }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'border-orange-600 text-orange-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {texto}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
