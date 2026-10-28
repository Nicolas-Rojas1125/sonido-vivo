import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerCategoria } from "../datos/categorias";
import { useCarrito } from "../contexto/useCarrito";
import { productosServicio } from "../servicios/productosServicio";
import { formatearPrecio } from "../utilidades/formato";
import { colorEstadoStock, obtenerEstadoStock, textoEstadoStock } from "../utilidades/stock";
import Alerta from "../componentes/atomos/Alerta";
import Boton from "../componentes/atomos/Boton";
import ImagenProducto from "../componentes/atomos/ImagenProducto";
import Insignia from "../componentes/atomos/Insignia";
import SelectorCantidad from "../componentes/moleculas/SelectorCantidad";

function DetalleProducto() {
    const { codigo } = useParams();
    const producto = productosServicio.obtenerPorCodigo(codigo ?? "");
    const { items, agregar } = useCarrito();
    const [cantidad, setCantidad] = useState(1);
    const [mensaje, setMensaje] = useState("");

    if (!producto) {
        return (
            <section className="container py-5">
                <h1 className="h3">Producto no encontrado</h1>
                <p>El producto que buscas no existe o fue eliminado del catálogo.</p>
                <Link className="btn btn-marca" to="/productos">
                    Volver al catálogo
                </Link>
            </section>
        );
    }

    const categoria = obtenerCategoria(producto.categoria);
    const estado = obtenerEstadoStock(producto.stock);
    const enCarrito = items.find((item) => item.codigo === producto.codigo)?.cantidad ?? 0;
    const disponible = producto.stock - enCarrito;

    const agregarProducto = () => {
        agregar(producto, cantidad);
        setMensaje("Agregaste " + cantidad + " × " + producto.nombre + " al carrito.");
        setCantidad(1);
    };

    return (
        <section className="container py-4">
            <nav aria-label="Ruta de navegación">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/productos">Catálogo</Link>
                    </li>
                    {categoria && (
                        <li className="breadcrumb-item">
                            <Link to={"/productos?categoria=" + categoria.valor}>{categoria.titulo}</Link>
                        </li>
                    )}
                    <li className="breadcrumb-item active" aria-current="page">
                        {producto.nombre}
                    </li>
                </ol>
            </nav>

            <div className="card p-3 p-md-4">
                <div className="row g-4 align-items-center">
                    <div className="col-12 col-md-5">
                        <ImagenProducto src={producto.imagen} alt={producto.nombre} clase="img-fluid rounded-3 imagen-detalle" />
                    </div>
                    <div className="col-12 col-md-7">
                        <p className="text-body-secondary mb-1">
                            {producto.marca} · Modelo {producto.modelo} · Cód. {producto.codigo}
                        </p>
                        <h1 className="h2">{producto.nombre}</h1>
                        <p>{producto.descripcion}</p>
                        <p className="precio fs-3 mb-2">{formatearPrecio(producto.precio)}</p>
                        <p className="mb-4">
                            <Insignia texto={textoEstadoStock[estado]} color={colorEstadoStock[estado]} />{" "}
                            <span className="small text-body-secondary">{producto.stock} unidades en stock</span>
                        </p>

                        <Alerta texto={mensaje} alCerrar={() => setMensaje("")} />

                        {disponible > 0 ? (
                            <div className="d-flex flex-wrap gap-3 align-items-center">
                                <div style={{ maxWidth: "10rem" }}>
                                    <SelectorCantidad cantidad={cantidad} maximo={disponible} alCambiar={setCantidad} />
                                </div>
                                <Boton texto="Agregar al carrito" tamano="lg" alClick={agregarProducto} />
                            </div>
                        ) : (
                            <p className="text-body-secondary">
                                {estado === "agotado"
                                    ? "Producto agotado. Escríbenos para avisarte cuando llegue."
                                    : "Ya tienes en tu carrito todas las unidades disponibles."}
                            </p>
                        )}
                        <Link className="btn btn-link px-0 mt-3" to="/productos">
                            ← Seguir comprando
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
export default DetalleProducto;
