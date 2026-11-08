import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

const claseLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidadCarrito = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0))
  const navigate = useNavigate()

  async function cerrarSesion() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-4 flex items-center gap-2 text-lg font-extrabold text-orange-600">
          <span aria-hidden>🍔</span> Food Store
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={claseLink}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseLink}>
            Carrito
            {cantidadCarrito > 0 && (
              <span className="ml-1.5 rounded-full bg-orange-600 px-1.5 py-0.5 text-xs text-white">{cantidadCarrito}</span>
            )}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={claseLink}>
              Mis pedidos
            </NavLink>
          )}
          {/* El acceso al panel solo se muestra al admin; la protección real está en el backend */}
          {usuario?.role === 'admin' && (
            <NavLink to="/admin" className={claseLink}>
              Panel admin
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {usuario ? (
            <>
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-slate-800">{usuario.full_name}</p>
                <p className="text-xs text-slate-500">
                  {usuario.username} · {usuario.role === 'admin' ? 'Administrador' : 'Cliente'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void cerrarSesion()}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseLink}>
                Ingresar
              </NavLink>
              <Link
                to="/register"
                className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
