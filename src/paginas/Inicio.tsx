import { useState } from "react";
import { Link } from "react-router-dom";
import { categorias } from "../datos/categorias";
import { beneficios, codigosDestacados, imagenesCarrusel } from "../datos/inicio";
import { tienda } from "../datos/tienda";
import { useCarrito } from "../contexto/useCarrito";
import { productosServicio } from "../servicios/productosServicio";
import type { Producto } from "../tipos/Producto";
import Alerta from "../componentes/atomos/Alerta";
import CardInfo from "../componentes/moleculas/CardInfo";
import Carrusel from "../componentes/organismos/Carrusel";
import GrillaProductos from "../componentes/organismos/GrillaProductos";
import Hero from "../componentes/organismos/Hero";

function Inicio() {
    const { agregar } = useCarrito();
    const [mensaje, setMensaje] = useState("");

    const destacados = codigosDestacados
        .map((codigo) => productosServicio.obtenerPorCodigo(codigo))
        .filter((producto): producto is Producto => producto !== undefined);

    const agregarProducto = (producto: Producto) => {
        agregar(producto);
        setMensaje(producto.nombre + " se agregó al carrito.");
    };

    return (
        <>
            <Hero
                titulo="Tu música empieza aquí"
                texto={
                    "Más de " + tienda.aniosFuncionamiento + " años en Providencia. Revisa nuestro catálogo con stock actualizado y compra desde cualquier ciudad de Chile."
                }
                textoBoton="Ver catálogo"
                ruta="/productos"
            />

            <div className="container">
                <section className="py-5" aria-label="Galería">
                    <Carrusel imagenes={imagenesCarrusel} />
                </section>

                <section className="pb-5" aria-labelledby="titulo-categorias">
                    <h2 id="titulo-categorias" className="h3 mb-3">
                        Categorías
                    </h2>
                    <div className="row row-cols-2 row-cols-md-5 g-3">
                        {categorias.map((categoria) => (
                            <div className="col" key={categoria.valor}>
                                <Link className="tarjeta-categoria" to={"/productos?categoria=" + categoria.valor}>
                                    {categoria.titulo}
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="pb-5" aria-labelledby="titulo-destacados">
                    <h2 id="titulo-destacados" className="h3 mb-3">
                        Productos destacados
                    </h2>
                    <Alerta texto={mensaje} alCerrar={() => setMensaje("")} />
                    <GrillaProductos productos={destacados} alAgregar={agregarProducto} />
                </section>

                <section aria-labelledby="titulo-beneficios">
                    <h2 id="titulo-beneficios" className="h3 mb-3">
                        ¿Por qué comprar en {tienda.nombre}?
                    </h2>
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
                        {beneficios.map((beneficio) => (
                            <div className="col" key={beneficio.titulo}>
                                <CardInfo titulo={beneficio.titulo} texto={beneficio.texto} icono={beneficio.icono} />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
export default Inicio;
