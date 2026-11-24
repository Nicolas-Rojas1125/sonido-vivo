import { Link, useNavigate } from "react-router-dom";
import { useCarrito } from "../contexto/useCarrito";
import { useSesion } from "../contexto/useSesion";
import Boton from "../componentes/atomos/Boton";
import FilaCarrito from "../componentes/moleculas/FilaCarrito";
import ResumenCompra from "../componentes/organismos/ResumenCompra";

function Carrito() {
    const { items, unidades, subtotal, cambiarCantidad, quitar, vaciar } = useCarrito();
    const navegar = useNavigate();
    const { usuario } = useSesion();
    // Solo el rol Cliente puede hacer pedidos. El invitado arma su carrito y, para pagar,
    // se registra o inicia sesión: después vuelve directo al checkout con el mismo carrito.
    const esInvitado = usuario === null;
    const puedeComprar = usuario?.rol === "cliente";
    const alCheckout = { desde: "/checkout" };

    if (items.length === 0) {
        return (
            <section className="container py-5 text-center">
                <h1 className="h3">Tu carrito está vacío</h1>
                <p>Revisa el catálogo y agrega los productos que te interesan.</p>
                <Link className="btn btn-marca" to="/productos">
                    Ir al catálogo
                </Link>
            </section>
        );
    }

    return (
        <section className="container py-4">
            <h1 className="h3 mb-4">Carrito de compras</h1>
            <div className="row g-4">
                <div className="col-12 col-lg-8">
                    <ul className="list-group">
                        {items.map((item) => (
                            <FilaCarrito key={item.codigo} item={item} alCambiarCantidad={cambiarCantidad} alQuitar={quitar} />
                        ))}
                    </ul>
                    <div className="d-flex justify-content-between mt-3">
                        <Link className="btn btn-link px-0" to="/productos">
                            ← Seguir comprando
                        </Link>
                        <Boton texto="Vaciar carrito" variante="outline-secondary" tamano="sm" alClick={vaciar} />
                    </div>
                </div>
                <div className="col-12 col-lg-4">
                    <ResumenCompra unidades={unidades} subtotal={subtotal}>
                        {puedeComprar ? (
                            <Boton texto="Continuar con la compra" anchoCompleto tamano="lg" alClick={() => navegar("/checkout")} />
                        ) : esInvitado ? (
                            <>
                                <p className="small mb-2" role="note">
                                    Estás comprando como <strong>invitado</strong>. Para finalizar el pedido crea tu cuenta o inicia sesión: tu carrito se mantiene.
                                </p>
                                <Boton texto="Crear cuenta y comprar" anchoCompleto tamano="lg" alClick={() => navegar("/registro", { state: alCheckout })} />
                                <Link className="btn btn-outline-secondary w-100 mt-2" to="/login" state={alCheckout}>
                                    Ya tengo cuenta: iniciar sesión
                                </Link>
                            </>
                        ) : (
                            <p className="small text-body-secondary mb-0" role="note">
                                Los pedidos online se hacen con una cuenta de Cliente. Tu rol permite gestionar pedidos y stock desde el Panel.
                            </p>
                        )}
                    </ResumenCompra>
                </div>
            </div>
        </section>
    );
}
export default Carrito;
