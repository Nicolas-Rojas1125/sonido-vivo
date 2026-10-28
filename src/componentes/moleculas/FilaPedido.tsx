import { useState } from "react";
import { etiquetasEstadoPedido, ordenEstados } from "../../datos/pedidos";
import type { EstadoPedido, Pedido } from "../../tipos/Pedido";
import { formatearFecha, formatearPrecio } from "../../utilidades/formato";
import Boton from "../atomos/Boton";
import Input from "../atomos/Input";
import Selector from "../atomos/Selector";

type Props = {
    pedido: Pedido;
    alActualizar: (id: number, estado: EstadoPedido, seguimiento: string) => void;
};

const opcionesEstado = ordenEstados.map((estado) => ({ valor: estado, etiqueta: etiquetasEstadoPedido[estado] }));

function FilaPedido({ pedido, alActualizar }: Props) {
    const [estado, setEstado] = useState<EstadoPedido>(pedido.estado);
    const [seguimiento, setSeguimiento] = useState(pedido.seguimiento);
    const hayCambios = estado !== pedido.estado || seguimiento !== pedido.seguimiento;

    return (
        <tr>
            <td className="fw-semibold text-nowrap">
                {pedido.numero}
                <div className="small text-body-secondary fw-normal">{formatearFecha(pedido.fecha)}</div>
            </td>
            <td>
                {pedido.clienteNombre}
                <div className="small text-body-secondary">{pedido.clienteCorreo}</div>
            </td>
            <td className="d-none d-lg-table-cell small">
                {pedido.items.map((item) => (
                    <div key={item.codigo}>
                        {item.cantidad} × {item.nombre}
                    </div>
                ))}
            </td>
            <td className="d-none d-md-table-cell">{pedido.tipoEntrega === "despacho" ? "Despacho" : "Retiro"}</td>
            <td className="text-end">{formatearPrecio(pedido.total)}</td>
            <td style={{ minWidth: "10rem" }}>
                <Selector
                    nombre={"estado-" + pedido.id}
                    valor={estado}
                    opciones={opcionesEstado}
                    etiquetaAria={"Estado del pedido " + pedido.numero}
                    alCambiar={(valor) => setEstado(valor as EstadoPedido)}
                />
                {pedido.tipoEntrega === "despacho" && (
                    <div className="mt-2">
                        <Input
                            tipo="text"
                            nombre={"seguimiento-" + pedido.id}
                            valor={seguimiento}
                            placeholder="N° seguimiento"
                            etiquetaAria={"Número de seguimiento del pedido " + pedido.numero}
                            alCambiar={setSeguimiento}
                        />
                    </div>
                )}
            </td>
            <td className="text-end">
                <Boton
                    texto="Guardar"
                    variante="success"
                    tamano="sm"
                    deshabilitado={!hayCambios}
                    etiquetaAria={"Guardar pedido " + pedido.numero}
                    alClick={() => alActualizar(pedido.id, estado, seguimiento)}
                />
            </td>
        </tr>
    );
}
export default FilaPedido;
