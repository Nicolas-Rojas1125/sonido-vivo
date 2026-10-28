import type { Producto } from "../../tipos/Producto";
import FilaProducto from "../moleculas/FilaProducto";

type Props = {
    productos: Producto[];
    alEditar: (producto: Producto) => void;
    alEliminar: (codigo: string) => void;
};

function TablaProductos({ productos, alEditar, alEliminar }: Props) {
    if (productos.length === 0) {
        return <p className="text-body-secondary">No hay productos registrados.</p>;
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle">
                <caption className="visually-hidden">Listado de productos</caption>
                <thead>
                    <tr>
                        <th scope="col">Código</th>
                        <th scope="col">Producto</th>
                        <th scope="col" className="d-none d-md-table-cell">Categoría</th>
                        <th scope="col" className="text-end">Precio</th>
                        <th scope="col" className="text-center">Stock</th>
                        <th scope="col" className="text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map((producto) => (
                        <FilaProducto key={producto.codigo} producto={producto} alEditar={alEditar} alEliminar={alEliminar} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default TablaProductos;
