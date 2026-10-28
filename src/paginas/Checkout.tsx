import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCarrito } from "../contexto/useCarrito";
import { useSesion } from "../contexto/useSesion";
import { COSTO_DESPACHO } from "../datos/tienda";
import { pedidosServicio } from "../servicios/pedidosServicio";
import { productosServicio } from "../servicios/productosServicio";
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
    // Evita que, al vaciar el carrito después de comprar, se redirija al carrito en vez de a "Mis pedidos"
    const [confirmado, setConfirmado] = useState(false);

    if (items.length === 0 && !confirmado) {
        return <Navigate to="/carrito" replace />;
    }

    const costoEnvio = tipoEntrega === "despacho" ? COSTO_DESPACHO : 0;

    const confirmar = (datos: DatosCheckout) => {
        // 1) Se descuenta el stock (si algún producto no alcanza, no se crea el pedido)
        const resultadoStock = productosServicio.descontarStock(items);
        if (!resultadoStock.ok) {
            setError(resultadoStock.mensaje);
            return;
        }

        // 2) Se registra el pedido
        const pedido = pedidosServicio.crear({
            clienteCorreo: usuario?.correo ?? datos.correo,
            clienteNombre: datos.nombre.trim(),
            telefono: datos.telefono.trim(),
            items: items.map((item) => ({ codigo: item.codigo, nombre: item.nombre, precio: item.precio, cantidad: item.cantidad })),
            tipoEntrega,
            direccion: tipoEntrega === "despacho" ? datos.direccion.trim() : "",
            comuna: tipoEntrega === "despacho" ? datos.comuna.trim() : "",
            puntoRetiro: tipoEntrega === "retiro" ? datos.puntoRetiro : "",
            medioPago: datos.medioPago as MedioPago,
            costoEnvio,
        });

        // 3) Se vacía el carrito y se muestra el pedido creado
        setConfirmado(true);
        vaciar();
        navegar("/mis-pedidos", { state: { nuevoPedido: pedido.numero } });
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
                                alConfirmar={confirmar}
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
