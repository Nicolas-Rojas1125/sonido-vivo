import { etiquetasEstadoPedido, ordenEstados } from "../../datos/pedidos";
import type { EstadoPedido } from "../../tipos/Pedido";

type Props = {
    estado: EstadoPedido;
};

// Línea de avance del pedido: En preparación → Despachado → Entregado
function SeguimientoPedido({ estado }: Props) {
    const posicionActual = ordenEstados.indexOf(estado);

    return (
        <ol className="seguimiento-pedido" aria-label="Estado del pedido">
            {ordenEstados.map((paso, posicion) => {
                const completado = posicion <= posicionActual;
                return (
                    <li
                        key={paso}
                        className={completado ? "completado" : ""}
                        aria-current={posicion === posicionActual ? "step" : undefined}
                    >
                        <span className="punto" aria-hidden="true">
                            {completado ? "✓" : posicion + 1}
                        </span>
                        <span className="texto">{etiquetasEstadoPedido[paso]}</span>
                    </li>
                );
            })}
        </ol>
    );
}
export default SeguimientoPedido;
