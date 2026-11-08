import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { UnauthorizedPage } from '../features/auth/pages/UnauthorizedPage'
import { AdminCategoriasPage } from '../features/categorias/pages/AdminCategoriasPage'
import { AdminPedidosPage } from '../features/pedidos/pages/AdminPedidosPage'
import { AdminResumenPage } from '../features/pedidos/pages/AdminResumenPage'
import { CarritoPage } from '../features/pedidos/pages/CarritoPage'
import { CheckoutPage } from '../features/pedidos/pages/CheckoutPage'
import { MisPedidosPage } from '../features/pedidos/pages/MisPedidosPage'
import { AdminProductosPage } from '../features/productos/pages/AdminProductosPage'
import { CatalogoPage } from '../features/productos/pages/CatalogoPage'
import { AdminUsuariosPage } from '../features/usuarios/pages/AdminUsuariosPage'
import { EstadoVacio } from '../shared/components/EstadoVacio'
import { AdminLayout } from '../shared/layout/AdminLayout'
import { MainLayout } from '../shared/layout/MainLayout'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Públicas */}
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Con sesión (cualquier rol) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          {/* Solo admin */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="resumen" replace />} />
              <Route path="resumen" element={<AdminResumenPage />} />
              <Route path="pedidos" element={<AdminPedidosPage />} />
              <Route path="productos" element={<AdminProductosPage />} />
              <Route path="categorias" element={<AdminCategoriasPage />} />
              <Route path="usuarios" element={<AdminUsuariosPage />} />
            </Route>
          </Route>

          <Route
            path="*"
            element={
              <EstadoVacio
                titulo="Página no encontrada"
                descripcion="La dirección no existe."
                accion={
                  <Link to="/" className="font-semibold text-orange-600 hover:underline">
                    Volver al catálogo
                  </Link>
                }
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
