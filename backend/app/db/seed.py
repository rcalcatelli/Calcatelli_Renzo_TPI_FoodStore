"""Carga inicial idempotente: python -m app.db.seed

Crea las tablas si faltan y agrega el usuario admin, las categorías y los productos
que todavía no existan. Se puede ejecutar varias veces sin duplicar datos.
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {
    "username": "admin",
    "full_name": "Administrador Food Store",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}

CATEGORIAS = [
    ("Pizzas", "Pizzas artesanales a la piedra"),
    ("Hamburguesas", "Hamburguesas de carne smash con papas"),
    ("Ensaladas", "Opciones frescas y livianas"),
    ("Bebidas", "Gaseosas, aguas y limonadas"),
    ("Postres", "Para cerrar con algo dulce"),
]


def _img(foto: str) -> str:
    return f"https://images.unsplash.com/photo-{foto}?w=600&q=80"


# (nombre, descripción, precio, stock, categoría, imagen)
PRODUCTOS = [
    ("Pizza muzzarella", "Salsa de tomate, muzzarella y orégano", 8500, 20, "Pizzas", _img("1513104890138-7c749659a591")),
    ("Pizza napolitana", "Muzzarella, tomate en rodajas y ajo", 9800, 15, "Pizzas", _img("1574071318508-1cdbab80d002")),
    ("Pizza especial", "Jamón, morrones y aceitunas", 10500, 12, "Pizzas", _img("1565299624946-b28f40a0ae38")),
    ("Hamburguesa clásica", "Medallón smash, cheddar, lechuga y tomate", 7900, 25, "Hamburguesas", _img("1568901346375-23c9450c58cd")),
    ("Hamburguesa doble", "Doble medallón, doble cheddar y panceta", 9900, 18, "Hamburguesas", _img("1550547660-d9450f859349")),
    ("Papas fritas", "Porción grande con sal marina", 4200, 30, "Hamburguesas", _img("1573080496219-bb080dd4f877")),
    ("Ensalada César", "Lechuga, pollo grillado, croutons y parmesano", 6900, 10, "Ensaladas", _img("1512621776951-a57141f2eefd")),
    ("Gaseosa 500 ml", "Línea Coca-Cola", 2200, 50, "Bebidas", _img("1622483767028-3f66f32aef97")),
    ("Limonada", "Con menta y jengibre, 500 ml", 2800, 40, "Bebidas", _img("1621263764928-df1444c5e859")),
    ("Helado artesanal", "Dos bochas a elección", 3900, 20, "Postres", _img("1497034825429-c343d7c6a68f")),
    ("Brownie", "Con nueces y dulce de leche", 3500, 15, "Postres", _img("1606313564200-e75d5e30476c")),
]


def cargar_admin(session: Session) -> None:
    if session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first():
        return
    session.add(
        Usuario(
            username=ADMIN["username"],
            full_name=ADMIN["full_name"],
            email=ADMIN["email"],
            hashed_password=hash_password(ADMIN["password"]),
            role="admin",
        )
    )


def cargar_categorias(session: Session) -> dict[str, Categoria]:
    categorias: dict[str, Categoria] = {}
    for nombre, descripcion in CATEGORIAS:
        categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
        if categoria is None:
            categoria = Categoria(nombre=nombre, descripcion=descripcion)
            session.add(categoria)
            session.flush()  # genera el id para los productos
        categorias[nombre] = categoria
    return categorias


def cargar_productos(session: Session, categorias: dict[str, Categoria]) -> None:
    for nombre, descripcion, precio, stock, categoria, imagen in PRODUCTOS:
        if session.exec(select(Producto).where(Producto.nombre == nombre)).first():
            continue
        session.add(
            Producto(
                nombre=nombre,
                descripcion=descripcion,
                precio_base=precio,
                stock=stock,
                imagen_url=imagen,
                categoria_id=categorias[categoria].id,
            )
        )


def main() -> None:
    create_all_tables()
    with Session(engine) as session:
        cargar_admin(session)
        categorias = cargar_categorias(session)
        cargar_productos(session, categorias)
        session.commit()
    print(f"Seed listo: usuario '{ADMIN['username']}', {len(CATEGORIAS)} categorías y {len(PRODUCTOS)} productos.")


if __name__ == "__main__":
    main()
