import { obtenerCategoria } from "../../datos/categorias";
import type { Producto } from "../../tipos/Producto";
import { formatearPrecio } from "../../utilidades/formato";
import { colorEstadoStock, obtenerEstadoStock } from "../../utilidades/stock";
import Boton from "../atomos/Boton";
import Insignia from "../atomos/Insignia";

type Props = {
    producto: Producto;
    alEditar: (producto: Producto) => void;
    alEliminar: (codigo: string) => void;
};

function FilaProducto({ producto, alEditar, alEliminar }: Props) {
    const categoria = obtenerCategoria(producto.categoria);
    const estado = obtenerEstadoStock(producto.stock);

    return (
        <tr>
            <td className="fw-semibold">{producto.codigo}</td>
            <td>
                {producto.nombre}
                <div className="small text-body-secondary">
                    {producto.marca} {producto.modelo}
                </div>
            </td>
            <td className="d-none d-md-table-cell">{categoria ? categoria.etiqueta : producto.categoria}</td>
            <td className="text-end">{formatearPrecio(producto.precio)}</td>
            <td className="text-center">
                <Insignia texto={String(producto.stock)} color={colorEstadoStock[estado]} />
            </td>
            <td>
                <div className="d-flex gap-2 justify-content-end">
                    <Boton texto="Editar" variante="warning" tamano="sm" alClick={() => alEditar(producto)} />
                    <Boton texto="Eliminar" variante="danger" tamano="sm" alClick={() => alEliminar(producto.codigo)} />
                </div>
            </td>
        </tr>
    );
}
export default FilaProducto;
