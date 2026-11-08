# Food Store — Trabajo Práctico Integrador

**Alumno:** Renzo Calcatelli · Programación IV · TUP a Distancia (UTN)

Aplicación web para un negocio de comidas: los clientes se registran, recorren el catálogo, arman
un carrito y confirman pedidos con dirección de entrega y forma de pago; el administrador gestiona
categorías, productos, stock, pedidos y usuarios desde un panel.

- **Repositorio:** https://github.com/USUARIO/Calcatelli_Renzo_TPI_FoodStore <!-- reemplazar por la URL pública -->
- **Video de demostración:** https://ENLACE-AL-VIDEO <!-- reemplazar por el link público -->

| Parte | Stack |
|---|---|
| `backend/` | Python 3.13 · FastAPI · SQLModel · PostgreSQL · JWT en cookie HttpOnly · Unit of Work |
| `frontend/` | React 19 + TypeScript (Vite) · Tailwind CSS 4 · TanStack Query, Form y Table · Zustand · Axios · React Router |

---

## Requisitos

- **Python 3.11 a 3.13** (SQLModel no funciona con 3.14)
- **PostgreSQL 15 o superior** en ejecución (para desarrollo se acepta SQLite, ver variables)
- **Node.js 20.19 o superior** y **pnpm 9 o superior** (`npm install -g pnpm`)

---

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate             # Windows (CMD / PowerShell)
# source .venv/Scripts/activate    # Windows con Git Bash
# source .venv/bin/activate        # macOS / Linux
pip install -r requirements.txt
copy .env.example .env             # Windows  ·  cp .env.example .env en macOS / Linux
python -m app.db.seed
uvicorn app.main:app --reload
```

Antes del seed, revisar en `.env` el usuario y la contraseña de PostgreSQL de `DATABASE_URL`.
La base `foodstore_db` **se crea sola** si no existe. El seed es idempotente: se puede correr
varias veces sin duplicar datos.

- API: http://localhost:8000/api/v1
- Swagger UI: http://localhost:8000/docs · ReDoc: http://localhost:8000/redoc

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://postgres:postgres@localhost:5432/foodstore_db` (desarrollo: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |

### Usuario del seed

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |

El seed también carga 5 categorías y 11 productos con stock. Los clientes se crean desde la
pantalla de registro (rol `user`).

---

## Frontend

Con el backend corriendo, en otra terminal:

```bash
cd frontend
pnpm install
copy .env.example .env             # Windows  ·  cp .env.example .env en macOS / Linux
pnpm build                         # verifica los tipos y compila
pnpm dev
```

Abrir http://localhost:5173.

### Variables de entorno (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

> **Windows:** si la carpeta del proyecto está en una ruta muy larga o con tildes (por ejemplo
> `Programación`), Python puede fallar con `DLL load failed` y Vite con
> `ERR_PACKAGE_IMPORT_NOT_DEFINED`. Copiar el proyecto a una ruta corta y sin tildes
> (por ejemplo `C:\dev\Calcatelli_Renzo_TPI_FoodStore`) y repetir la instalación.

---

## Arquitectura

### Backend: módulos por dominio y capas

```
backend/
├── app/
│   ├── main.py                 # FastAPI, CORS con credenciales, routers bajo /api/v1
│   ├── core/
│   │   ├── config.py           # Settings (pydantic-settings, lee .env)
│   │   ├── database.py         # engine, create_all_tables, session_factory
│   │   ├── security.py         # hash bcrypt, create_access_token, decode_access_token
│   │   ├── deps.py             # get_current_user, get_current_active_user, require_role
│   │   ├── unit_of_work.py     # UnitOfWork: abre la sesión en __enter__; commit/rollback/close en __exit__
│   │   └── base_repository.py  # BaseRepository[T]: get_by_id, get_all, add, delete
│   ├── modules/
│   │   ├── auth/               # router · service · schemas (usa el modelo Usuario)
│   │   ├── usuarios/           # models · schemas · repository · unit_of_work · service · router
│   │   ├── categorias/         # ídem
│   │   ├── productos/          # ídem
│   │   └── pedidos/            # ídem: Pedido y DetallePedido, RN-01 a RN-06
│   └── db/seed.py              # admin, categorías y productos (idempotente)
├── tests/api.http              # pruebas manuales con REST Client
└── requirements.txt            # versiones fijadas
```

| Capa | Responsabilidad |
|---|---|
| **Router** | HTTP: valida con schemas, resuelve sesión y rol con `Depends`, obtiene el Service con `Depends(get_<modulo>_service)` y traduce las excepciones de dominio a `HTTPException`. No abre el Unit of Work. |
| **Service** | Reglas de negocio. Abre `with self.uow as uow:` y devuelve el schema de salida dentro del bloque. Lanza excepciones de dominio (`ProductoNoEncontrado`, `StockInsuficiente`, `TransicionInvalida`…). |
| **Unit of Work** | Crea la sesión, expone los repositorios que la comparten y hace commit o rollback en `__exit__`. **Es la única capa que confirma la transacción.** |
| **Repository** | Consultas con `select`; hereda de `BaseRepository[T]`. Sin reglas de negocio. |
| **Model / Schemas** | Tablas SQLModel (`table=True`) con `Relationship` y `back_populates`; schemas de entrada y salida sin `table=True`. |

### Frontend: organización por features

```
frontend/src/
├── shared/
│   ├── api/          # axiosInstance (withCredentials + interceptor de 401), handleApiError, queryClient
│   ├── ui/           # Button, Card, Input, Modal, BadgeEstado, ConfirmDialog
│   ├── components/   # Paginacion, Skeleton, EstadoVacio, EstadoError, DataTable
│   ├── layout/       # Navbar, MainLayout, AdminLayout, PageHeader
│   └── utils/        # formato de precios y fechas, validadores de formularios
├── features/
│   ├── auth/         # LoginPage, RegisterPage, UnauthorizedPage
│   ├── categorias/   # AdminCategoriasPage, useCategorias
│   ├── productos/    # CatalogoPage, AdminProductosPage, ProductoCard, useProductos
│   ├── usuarios/     # AdminUsuariosPage, useUsuarios
│   └── pedidos/      # CarritoPage, CheckoutPage, MisPedidosPage, AdminPedidosPage, AdminResumenPage
│                     # (cada feature: pages · components · hooks · api · types)
├── store/            # authStore y cartStore (Zustand + persist)
├── routes/           # AppRouter y ProtectedRoute
├── App.tsx           # checkSession al montar
└── main.tsx          # QueryClientProvider
```

- **Estado del servidor** (catálogo, pedidos, usuarios, resumen): TanStack Query con `useQuery`,
  `useMutation` e `invalidateQueries`. Ningún componente hace `fetch` dentro de `useEffect`; la única
  llamada en `useEffect` es `checkSession` al montar la aplicación.
- **Estado del cliente**: `authStore` (usuario, cargando, login, logout, checkSession; `partialize`
  guarda solo el usuario, **nunca el token**) y `cartStore` (ítems, agregar, quitar,
  cambiarCantidad, vaciar, total), ambos con `persist`.
- **Sesión**: el JWT viaja solo en la cookie HttpOnly `access_token`; el frontend no lo lee ni lo
  guarda. El interceptor de Axios limpia la sesión ante un 401 (fuera de `/auth/token` y `/auth/me`)
  o ante «Cuenta de usuario desactivada», y `ProtectedRoute` redirige a `/login` o a `/unauthorized`.

---

## Rutas del frontend

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Catálogo paginado en el servidor, búsqueda, filtro por categoría, skeleton y estado vacío | Público |
| `/login` · `/register` | Formularios con TanStack Form | Público |
| `/carrito` | Ítems, cantidades, subtotal y total (persiste al recargar) | Público |
| `/checkout` | Dirección, forma de pago y notas; crea el pedido y vacía el carrito | Sesión |
| `/mis-pedidos` | Pedidos propios con detalle; cancelar solo en `PENDIENTE` | Sesión |
| `/admin/resumen` | Tarjetas con los indicadores | admin |
| `/admin/categorias` · `/admin/productos` | ABM con TanStack Table y Form; stock y disponibilidad | admin |
| `/admin/pedidos` | Tabla con filtro por estado; avanzar o cancelar según la máquina de estados | admin |
| `/admin/usuarios` | Activar y desactivar (sin «Desactivar» en la fila propia) | admin |
| `/unauthorized` | Sin permiso | Público |

---

## API REST (`/api/v1`)

| Método | Endpoint | Acceso | Respuesta | Errores propios |
|---|---|---|---|---|
| POST | `/auth/register` | Público | 201 `UserPublic` | 409 username o email existentes |
| POST | `/auth/token` | Público | 200 + cookie HttpOnly | 401 credenciales; 400 cuenta desactivada |
| POST | `/auth/logout` | Público | 200 (borra la cookie) | — |
| GET | `/auth/me` | Sesión | 200 `UserPublic` | — |
| GET | `/admin/usuarios` | admin | 200 `list[UserPublic]` | — |
| POST | `/admin/usuarios/{id}/activar` | admin | 200 `UserPublic` | 404 |
| POST | `/admin/usuarios/{id}/desactivar` | admin | 200 `UserPublic` | 404; 400 si se desactiva a sí mismo |
| GET | `/categorias` · `/categorias/{id}` | Público | 200 | 404 |
| POST | `/categorias` | admin | 201 `CategoriaRead` | 409 |
| PUT | `/categorias/{id}` | admin | 200 (actualización parcial) | 404, 409 |
| DELETE | `/categorias/{id}` | admin | 204 (baja lógica) | 404 |
| GET | `/productos?skip&limit&search&categoria_id&disponible` | Público | 200 `{total, items}` | — |
| GET | `/productos/{id}` | Público | 200 `ProductoRead` | 404 |
| POST | `/productos` | admin | 201 | 404 categoría inexistente o dada de baja |
| PUT | `/productos/{id}` | admin | 200 (actualización parcial) | 404 |
| PATCH | `/productos/{id}/stock` | admin | 200 | 404 |
| DELETE | `/productos/{id}` | admin | 204 (baja lógica) | 404 |
| POST | `/pedidos` | Sesión | 201 `PedidoRead` | 404 producto; 400 stock, no disponible o repetido |
| GET | `/pedidos?skip&limit&estado` | Sesión | 200 propios (user) o todos (admin) | — |
| GET | `/pedidos/resumen` | admin | 200 `ResumenPedidos` | — |
| GET | `/pedidos/{id}` | Dueño o admin | 200 | 404; 403 ajeno |
| PATCH | `/pedidos/{id}/estado` | admin | 200 | 404; 400 transición inválida |
| PATCH | `/pedidos/{id}/cancelar` | Dueño | 200 | 404; 403 ajeno; 400 si no está en `PENDIENTE` |

Comunes a todos: **401** sin sesión válida, **400** «Cuenta de usuario desactivada», **403** rol no
permitido y **422** cuerpo o parámetros inválidos. Un registro dado de baja se trata como
inexistente (404).

---

## Reglas de negocio

| Regla | Implementación |
|---|---|
| **RN-01** Crear pedido | Al menos un ítem y sin productos repetidos. Por cada ítem se bloquea la fila del producto (`SELECT … FOR UPDATE`), se verifica que esté activo, disponible y con stock, se descuenta y se crea la línea copiando nombre y precio. Todo en un solo Unit of Work: si algo falla, rollback y no se persiste nada, tampoco el stock. |
| **RN-02** Transiciones | Diccionario `TRANSICIONES` en el Service: `PENDIENTE → EN_PREPARACION │ CANCELADO`, `EN_PREPARACION → ENTREGADO │ CANCELADO`; `ENTREGADO` y `CANCELADO` son terminales (400). |
| **RN-03** Cancelar | Restituye el stock de cada línea en la misma transacción que cambia el estado. |
| **RN-04** Permisos | El cliente ve y cancela solo sus pedidos y solo en `PENDIENTE`; el admin ve todos y avanza o cancela desde cualquier estado no terminal. |
| **RN-05** Inmutabilidad | Líneas y total fijos desde la creación; no hay endpoints de edición ni borrado de pedidos. |
| **RN-06** Datos del pedido | `forma_pago` ∈ {`EFECTIVO`, `TRANSFERENCIA`} y `direccion_entrega` de 5 a 200 caracteres, validados en el schema. |

---

## Pruebas manuales

`backend/tests/api.http` recorre la API con la extensión **REST Client** de VS Code: registro,
login, catálogo, creación de pedidos con sus errores, cancelación con restitución de stock,
máquina de estados, gestión de usuarios y bajas lógicas. REST Client guarda la cookie del login y
la envía en las peticiones siguientes.

> **Nota sobre dependencias:** `SQLAlchemy` queda fijado en la serie 2.0. A partir de 2.1, una URL
> `postgresql://` usa por defecto el driver psycopg 3 en lugar de `psycopg2-binary`, que es el que
> pide la consigna.
