import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { obtenerCategoria } from "../datos/categorias";
import { useCarrito } from "../contexto/useCarrito";
import { productosServicio } from "../servicios/productosServicio";
import type { CategoriaFiltro, Producto } from "../tipos/Producto";
import { filtrarProductos, ordenarProductos } from "../utilidades/filtros";
import type { Orden } from "../utilidades/filtros";
import { esCategoria } from "../utilidades/validaciones";
import Alerta from "../componentes/atomos/Alerta";
import Selector from "../componentes/atomos/Selector";
import CampoFormulario from "../componentes/moleculas/CampoFormulario";
import FiltroCategorias from "../componentes/moleculas/FiltroCategorias";
import GrillaProductos from "../componentes/organismos/GrillaProductos";
import Hero from "../componentes/organismos/Hero";

const opcionesOrden = [
    { valor: "relevancia", etiqueta: "Ordenar: destacados" },
    { valor: "precio-asc", etiqueta: "Precio: menor a mayor" },
    { valor: "precio-desc", etiqueta: "Precio: mayor a menor" },
    { valor: "nombre", etiqueta: "Nombre A-Z" },
];

function Productos() {
    // La categoría se guarda en la URL (?categoria=bajos) para poder compartir el enlace
    const [parametros, setParametros] = useSearchParams();
    const valorUrl = parametros.get("categoria") ?? "";
    const categoria: CategoriaFiltro = esCategoria(valorUrl) ? valorUrl : "todos";

    const [busqueda, setBusqueda] = useState("");
    const [orden, setOrden] = useState<Orden>("relevancia");
    const [mensaje, setMensaje] = useState("");
    const { agregar } = useCarrito();

    const productos = ordenarProductos(filtrarProductos(productosServicio.obtenerTodos(), categoria, busqueda), orden);
    const infoCategoria = obtenerCategoria(categoria);

    const seleccionarCategoria = (nueva: CategoriaFiltro) => {
        setParametros(nueva === "todos" ? {} : { categoria: nueva });
    };

    const agregarProducto = (producto: Producto) => {
        agregar(producto);
        setMensaje(producto.nombre + " se agregó al carrito.");
    };

    return (
        <>
            <Hero titulo="Catálogo" texto="Precios y stock actualizados. Compra online con despacho o retiro en tienda." compacto />

            <div className="container py-4">
                <section aria-label="Filtros" className="mb-4">
                    <FiltroCategorias categoriaActiva={categoria} alSeleccionar={seleccionarCategoria} />
                    <div className="row g-3 mt-1 align-items-end">
                        <div className="col-12 col-md-8">
                            <CampoFormulario
                                etiqueta="Buscar por nombre, marca, modelo o código"
                                tipo="search"
                                nombre="busqueda"
                                valor={busqueda}
                                alCambiar={setBusqueda}
                                placeholder="Ej: Yamaha, SM58, pedal"
                            />
                        </div>
                        <div className="col-12 col-md-4 mb-3">
                            <Selector
                                nombre="orden"
                                valor={orden}
                                opciones={opcionesOrden}
                                etiquetaAria="Ordenar productos"
                                alCambiar={(valor) => setOrden(valor as Orden)}
                            />
                        </div>
                    </div>
                </section>

                <div className="d-flex justify-content-between align-items-baseline mb-3">
                    <h2 className="h4 mb-0">{infoCategoria ? infoCategoria.titulo : "Todos los productos"}</h2>
                    <span className="text-body-secondary small" role="status">
                        {productos.length} {productos.length === 1 ? "producto" : "productos"}
                    </span>
                </div>

                <Alerta texto={mensaje} alCerrar={() => setMensaje("")} />

                <GrillaProductos
                    productos={productos}
                    alAgregar={agregarProducto}
                    mensajeVacio="No se encontraron productos con los filtros seleccionados."
                />
            </div>
        </>
    );
}
export default Productos;
