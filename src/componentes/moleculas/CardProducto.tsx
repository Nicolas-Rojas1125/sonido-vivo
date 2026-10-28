import { Link } from "react-router-dom";
import type { Producto } from "../../tipos/Producto";
import { formatearPrecio } from "../../utilidades/formato";
import { colorEstadoStock, obtenerEstadoStock, textoEstadoStock } from "../../utilidades/stock";
import Boton from "../atomos/Boton";
import ImagenProducto from "../atomos/ImagenProducto";
import Insignia from "../atomos/Insignia";

type Props = {
    producto: Producto;
    alAgregar: (producto: Producto) => void;
};

function CardProducto({ producto, alAgregar }: Props) {
    const estado = obtenerEstadoStock(producto.stock);

    return (
        <article className="card h-100 tarjeta-producto">
            <Link to={"/productos/" + producto.codigo} className="contenedor-imagen" tabIndex={-1} aria-hidden="true">
                <ImagenProducto src={producto.imagen} alt={producto.nombre} clase="card-img-top" />
            </Link>
            <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-body-secondary">{producto.marca}</small>
                    <Insignia texto={textoEstadoStock[estado]} color={colorEstadoStock[estado]} />
                </div>
                <h3 className="h6 card-title">
                    <Link to={"/productos/" + producto.codigo} className="enlace-producto">
                        {producto.nombre}
                    </Link>
                </h3>
                <p className="small text-body-secondary mb-2">Modelo: {producto.modelo}</p>
                <p className="precio mt-auto mb-3">{formatearPrecio(producto.precio)}</p>
                <Boton
                    texto={estado === "agotado" ? "Sin stock" : "Agregar al carrito"}
                    deshabilitado={estado === "agotado"}
                    anchoCompleto
                    etiquetaAria={"Agregar " + producto.nombre + " al carrito"}
                    alClick={() => alAgregar(producto)}
                />
            </div>
        </article>
    );
}
export default CardProducto;
