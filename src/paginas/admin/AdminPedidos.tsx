import { useState } from "react";
import { etiquetasEstadoPedido, ordenEstados } from "../../datos/pedidos";
import { pedidosServicio } from "../../servicios/pedidosServicio";
import type { EstadoPedido, Pedido } from "../../tipos/Pedido";
import Alerta from "../../componentes/atomos/Alerta";
import Selector from "../../componentes/atomos/Selector";
import TablaPedidos from "../../componentes/organismos/TablaPedidos";

function AdminPedidos() {
    const [pedidos, setPedidos] = useState<Pedido[]>(() => pedidosServicio.obtenerTodos());
    const [filtro, setFiltro] = useState<EstadoPedido | "">("");
    const [mensaje, setMensaje] = useState("");

    const visibles = filtro === "" ? pedidos : pedidos.filter((pedido) => pedido.estado === filtro);

    const actualizar = (id: number, estado: EstadoPedido, seguimiento: string) => {
        const actualizado = pedidosServicio.actualizarEstado(id, estado, seguimiento);
        if (actualizado) {
            setPedidos(pedidosServicio.obtenerTodos());
            setMensaje("Pedido " + actualizado.numero + " actualizado a \"" + etiquetasEstadoPedido[estado] + "\".");
        }
    };

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h1 className="h3 mb-0">Pedidos</h1>
                <div style={{ minWidth: "14rem" }}>
                    <Selector
                        nombre="filtro-estado"
                        valor={filtro}
                        textoVacio="Todos los estados"
                        opciones={ordenEstados.map((estado) => ({ valor: estado, etiqueta: etiquetasEstadoPedido[estado] }))}
                        etiquetaAria="Filtrar pedidos por estado"
                        alCambiar={(valor) => setFiltro(valor as EstadoPedido | "")}
                    />
                </div>
            </div>
            <Alerta texto={mensaje} alCerrar={() => setMensaje("")} />
            <div className="card">
                <div className="card-body">
                    <TablaPedidos pedidos={visibles} alActualizar={actualizar} />
                </div>
            </div>
        </>
    );
}
export default AdminPedidos;
