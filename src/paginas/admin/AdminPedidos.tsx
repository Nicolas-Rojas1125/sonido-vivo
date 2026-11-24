import { useState } from "react";
import { etiquetasEstadoPedido, ordenEstados } from "../../datos/pedidos";
import { mensajeDeError } from "../../servicios/api";
import { pedidosServicio } from "../../servicios/pedidosServicio";
import { useCargar } from "../../servicios/useCargar";
import type { EstadoPedido } from "../../tipos/Pedido";
import Alerta from "../../componentes/atomos/Alerta";
import Selector from "../../componentes/atomos/Selector";
import EstadoCarga from "../../componentes/moleculas/EstadoCarga";
import TablaPedidos from "../../componentes/organismos/TablaPedidos";

function AdminPedidos() {
    // GET /api/pedidos (Administrador y Vendedor)
    const consulta = useCargar(() => pedidosServicio.listarTodos());
    const pedidos = consulta.datos ?? [];
    const [filtro, setFiltro] = useState<EstadoPedido | "">("");
    const [mensaje, setMensaje] = useState({ texto: "", tipo: "success" as "success" | "danger" });

    const visibles = filtro === "" ? pedidos : pedidos.filter((pedido) => pedido.estado === filtro);

    // PUT /api/pedidos/{id}/estado
    const actualizar = async (id: number, estado: EstadoPedido, seguimiento: string) => {
        try {
            const actualizado = await pedidosServicio.actualizarEstado(id, estado, seguimiento);
            setMensaje({ texto: "Pedido " + actualizado.numero + " actualizado a \"" + etiquetasEstadoPedido[estado] + "\".", tipo: "success" });
            consulta.recargar();
        } catch (error) {
            setMensaje({ texto: mensajeDeError(error, "No se pudo actualizar el pedido."), tipo: "danger" });
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
            <Alerta texto={mensaje.texto} tipo={mensaje.tipo} alCerrar={() => setMensaje({ ...mensaje, texto: "" })} />
            <div className="card">
                <div className="card-body">
                    <EstadoCarga cargando={consulta.cargando} error={consulta.error} alReintentar={consulta.recargar} texto="Cargando pedidos..." />
                    {consulta.datos && (
                        <TablaPedidos pedidos={visibles} alActualizar={(id, estado, seguimiento) => void actualizar(id, estado, seguimiento)} />
                    )}
                </div>
            </div>
        </>
    );
}
export default AdminPedidos;
