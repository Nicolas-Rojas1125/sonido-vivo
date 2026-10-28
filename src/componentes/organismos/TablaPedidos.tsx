import type { EstadoPedido, Pedido } from "../../tipos/Pedido";
import FilaPedido from "../moleculas/FilaPedido";

type Props = {
    pedidos: Pedido[];
    alActualizar: (id: number, estado: EstadoPedido, seguimiento: string) => void;
};

function TablaPedidos({ pedidos, alActualizar }: Props) {
    if (pedidos.length === 0) {
        return <p className="text-body-secondary">No hay pedidos con este filtro.</p>;
    }

    return (
        <div className="table-responsive">
            <table className="table align-middle">
                <caption className="visually-hidden">Pedidos de clientes</caption>
                <thead>
                    <tr>
                        <th scope="col">Pedido</th>
                        <th scope="col">Cliente</th>
                        <th scope="col" className="d-none d-lg-table-cell">Productos</th>
                        <th scope="col" className="d-none d-md-table-cell">Entrega</th>
                        <th scope="col" className="text-end">Total</th>
                        <th scope="col">Estado</th>
                        <th scope="col" className="text-end">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {pedidos.map((pedido) => (
                        <FilaPedido key={pedido.id + "-" + pedido.estado + "-" + pedido.seguimiento} pedido={pedido} alActualizar={alActualizar} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default TablaPedidos;
