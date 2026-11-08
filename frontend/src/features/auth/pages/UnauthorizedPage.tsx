import { Link } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'

export function UnauthorizedPage() {
  return (
    <EstadoVacio
      titulo="Sin permiso"
      descripcion="Tu usuario no tiene acceso a esta sección."
      accion={
        <Link to="/" className="font-semibold text-orange-600 hover:underline">
          Volver al inicio
        </Link>
      }
    />
  )
}
