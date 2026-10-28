import type { Producto } from "../../tipos/Producto";
import CardProducto from "../moleculas/CardProducto";

type Props = {
    productos: Producto[];
    alAgregar: (producto: Producto) => void;
    mensajeVacio?: string;
};

// Grilla responsiva: 1 columna en móvil, 2 en tablet, 3 en notebook y 4 en escritorio grande
function GrillaProductos({ productos, alAgregar, mensajeVacio = "No hay productos para mostrar." }: Props) {
    if (productos.length === 0) {
        return <p className="text-body-secondary">{mensajeVacio}</p>;
    }

    return (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {productos.map((producto) => (
                <div className="col" key={producto.codigo}>
                    <CardProducto producto={producto} alAgregar={alAgregar} />
                </div>
            ))}
        </div>
    );
}
export default GrillaProductos;
