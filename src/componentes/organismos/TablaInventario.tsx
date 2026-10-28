import type { Producto } from "../../tipos/Producto";
import FilaInventario from "../moleculas/FilaInventario";

type Props = {
    productos: Producto[];
    alGuardarStock: (codigo: string, stock: number) => void;
};

function TablaInventario({ productos, alGuardarStock }: Props) {
    if (productos.length === 0) {
        return <p className="text-body-secondary">No hay productos que coincidan.</p>;
    }

    return (
        <div className="table-responsive">
            <table className="table align-middle">
                <caption className="visually-hidden">Inventario de productos</caption>
                <thead>
                    <tr>
                        <th scope="col" className="d-none d-sm-table-cell">Código</th>
                        <th scope="col">Producto</th>
                        <th scope="col" className="d-none d-sm-table-cell">Estado</th>
                        <th scope="col">Stock</th>
                        <th scope="col" className="text-end">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((producto) => (
                        // La key incluye el stock: si cambia desde afuera, la fila se reinicia con el valor nuevo
                        <FilaInventario key={producto.codigo + "-" + producto.stock} producto={producto} alGuardar={alGuardarStock} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default TablaInventario;
