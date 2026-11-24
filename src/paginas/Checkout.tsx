import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCarrito } from "../contexto/useCarrito";
import { useSesion } from "../contexto/useSesion";
import { COSTO_DESPACHO } from "../datos/tienda";
import { mensajeDeError } from "../servicios/api";
import { pedidosServicio } from "../servicios/pedidosServicio";
import type { DatosCheckout, MedioPago, TipoEntrega } from "../tipos/Pedido";
import Alerta from "../componentes/atomos/Alerta";
import FormularioCheckout from "../componentes/organismos/FormularioCheckout";
import ResumenCompra from "../componentes/organismos/ResumenCompra";

function Checkout() {
    const { usuario } = useSesion();
    const { items, unidades, subtotal, vaciar } = useCarrito();
    const navegar = useNavigate();

    // Estado "levantado": el formulario avisa el tipo de entrega y aquí se calcula el costo de envío
    const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>("despacho");
    const [error, setError] = useState("");
    const [procesando, setProcesando] = useState(false);
    // Evita que, al vaciar el carrito después de comprar, se redirija al carrito en vez de a "Mis pedidos"
    const [confirmado, setConfirmado] = useState(false);

    if (items.length === 0 && !confirmado) {
        return <Navigate to="/carrito" replace />;
    }

    const costoEnvio = tipoEntrega === "despacho" ? COSTO_DESPACHO : 0;

    // POST /api/pedidos (ms-tienda). El backend, en UNA transacción:
    //  - toma los precios desde la base de datos (no confía en los del navegador),
    //  - descuenta el stock (si un producto no alcanza responde 409 y no se crea nada),
    //  - calcula el total y guarda el pedido con el correo del token.
    const confirmar = async (datos: DatosCheckout) => {
        setProcesando(true);
        setError("");
        try {
            const pedido = await pedidosServicio.crear({
                clienteNombre: datos.nombre.trim(),
                telefono: datos.telefono.trim(),
                items: items.map((item) => ({ codigo: item.codigo, cantidad: item.cantidad })),
                tipoEntrega,
                direccion: tipoEntrega === "despacho" ? datos.direccion.trim() : "",
                comuna: tipoEntrega === "despacho" ? datos.comuna.trim() : "",
                puntoRetiro: tipoEntrega === "retiro" ? datos.puntoRetiro : "",
                medioPago: datos.medioPago as MedioPago,
            });

            // Se vacía el carrito y se muestra el pedido creado
            setConfirmado(true);
            vaciar();
            navegar("/mis-pedidos", { state: { nuevoPedido: pedido.numero } });
        } catch (e) {
            setError(mensajeDeError(e, "No se pudo registrar el pedido. Intenta nuevamente."));
            setProcesando(false);
        }
    };

    return (
        <section className="container py-4">
            <h1 className="h3 mb-4">Finalizar compra</h1>
            <Alerta texto={error} tipo="danger" alCerrar={() => setError("")} />
            <div className="row g-4">
                <div className="col-12 col-lg-8">
                    <div className="card">
                        <div className="card-body">
                            <FormularioCheckout
                                nombreInicial={usuario?.nombre ?? ""}
                                correoInicial={usuario?.correo ?? ""}
                                tipoEntrega={tipoEntrega}
                                alCambiarEntrega={setTipoEntrega}
                                alConfirmar={(datos) => void confirmar(datos)}
                                procesando={procesando}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-4">
                    <ResumenCompra unidades={unidades} subtotal={subtotal} costoEnvio={costoEnvio}>
                        <ul className="list-unstyled small mb-0">
                            {items.map((item) => (
                                <li key={item.codigo}>
                                    {item.cantidad} × {item.nombre}
                                </li>
                            ))}
                        </ul>
                    </ResumenCompra>
                </div>
            </div>
        </section>
    );
}
export default Checkout;
