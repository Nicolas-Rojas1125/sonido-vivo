import { Link, useLocation } from "react-router-dom";
import { useSesion } from "../contexto/useSesion";
import { colorEstadoPedido, etiquetasEstadoPedido } from "../datos/pedidos";
import { puntosRetiro } from "../datos/tienda";
import { pedidosServicio } from "../servicios/pedidosServicio";
import type { Pedido } from "../tipos/Pedido";
import { formatearFecha, formatearPrecio } from "../utilidades/formato";
import Alerta from "../componentes/atomos/Alerta";
import Insignia from "../componentes/atomos/Insignia";
import SeguimientoPedido from "../componentes/moleculas/SeguimientoPedido";

function textoEntrega(pedido: Pedido): string {
    if (pedido.tipoEntrega === "despacho") {
        return "Despacho a " + pedido.direccion + ", " + pedido.comuna;
    }
    const punto = puntosRetiro.find((p) => p.id === pedido.puntoRetiro);
    return "Retiro en " + (punto ? punto.nombre : "tienda");
}

function MisPedidos() {
    const { usuario } = useSesion();
    const ubicacion = useLocation();
    const nuevoPedido = (ubicacion.state as { nuevoPedido?: string } | null)?.nuevoPedido ?? "";

    // Un cliente solo ve sus propios pedidos
    const pedidos = usuario ? pedidosServicio.obtenerPorCliente(usuario.correo) : [];

    return (
        <section className="container py-4">
            <h1 className="h3 mb-4">Mis pedidos</h1>
            {nuevoPedido && (
                <Alerta texto={"¡Gracias por tu compra! Tu pedido " + nuevoPedido + " fue recibido y está en preparación."} />
            )}

            {pedidos.length === 0 ? (
                <p>
                    Aún no tienes pedidos. <Link to="/productos">Revisa el catálogo</Link>.
                </p>
            ) : (
                <div className="row g-4">
                    {pedidos.map((pedido) => (
                        <div className="col-12" key={pedido.id}>
                            <article className="card">
                                <div className="card-header d-flex flex-wrap justify-content-between gap-2">
                                    <span>
                                        <strong>{pedido.numero}</strong> · {formatearFecha(pedido.fecha)}
                                    </span>
                                    <Insignia texto={etiquetasEstadoPedido[pedido.estado]} color={colorEstadoPedido[pedido.estado]} />
                                </div>
                                <div className="card-body">
                                    <SeguimientoPedido estado={pedido.estado} />
                                    <div className="row g-3 mt-1">
                                        <div className="col-12 col-md-7">
                                            <ul className="list-unstyled mb-0">
                                                {pedido.items.map((item) => (
                                                    <li key={item.codigo}>
                                                        {item.cantidad} × {item.nombre} – {formatearPrecio(item.precio * item.cantidad)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="col-12 col-md-5 text-md-end">
                                            <p className="mb-1 small">{textoEntrega(pedido)}</p>
                                            {pedido.seguimiento && <p className="mb-1 small">N° seguimiento: {pedido.seguimiento}</p>}
                                            <p className="mb-0 fw-bold">Total: {formatearPrecio(pedido.total)}</p>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
export default MisPedidos;
