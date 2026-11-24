import { Link } from "react-router-dom";
import { etiquetasEstadoPedido, ordenEstados } from "../../datos/pedidos";
import { pedidosServicio } from "../../servicios/pedidosServicio";
import { productosServicio } from "../../servicios/productosServicio";
import { useCargar } from "../../servicios/useCargar";
import { formatearPrecio } from "../../utilidades/formato";
import { obtenerEstadoStock } from "../../utilidades/stock";
import EstadoCarga from "../../componentes/moleculas/EstadoCarga";
import TarjetaResumen from "../../componentes/moleculas/TarjetaResumen";

// Resumen del panel. Pide al mismo tiempo (Promise.all) el resumen de ventas y el catálogo:
// las dos peticiones viajan en paralelo, así la página carga más rápido.
function PanelResumen() {
    const consulta = useCargar(() => Promise.all([pedidosServicio.obtenerResumen(), productosServicio.listar()]));

    if (!consulta.datos) {
        return (
            <>
                <h1 className="h3 mb-4">Resumen de la tienda</h1>
                <EstadoCarga cargando={consulta.cargando} error={consulta.error} alReintentar={consulta.recargar} texto="Cargando resumen..." />
            </>
        );
    }

    const [resumen, productos] = consulta.datos;
    const criticos = productos.filter((p) => obtenerEstadoStock(p.stock) !== "disponible");

    return (
        <div>
            <h1 className="h3 mb-4">Resumen de la tienda</h1>

            <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
                <div className="col">
                    <TarjetaResumen titulo="Ventas totales" valor={formatearPrecio(resumen.totalVentas)} detalle={resumen.cantidadPedidos + " pedidos"} />
                </div>
                {ordenEstados.map((estado) => (
                    <div className="col" key={estado}>
                        <TarjetaResumen
                            titulo={etiquetasEstadoPedido[estado]}
                            valor={String(resumen.porEstado[estado] ?? 0)}
                            detalle="pedidos"
                            color={estado === "preparacion" ? "warning" : estado === "despachado" ? "info" : "success"}
                        />
                    </div>
                ))}
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                        <h2 className="h5 mb-0">Stock crítico ({criticos.length})</h2>
                        <Link className="btn btn-sm btn-outline-marca" to="/admin/inventario">
                            Ir a inventario
                        </Link>
                    </div>
                    {criticos.length === 0 ? (
                        <p className="mb-0 text-body-secondary">Todos los productos tienen stock suficiente.</p>
                    ) : (
                        <ul className="mb-0">
                            {criticos.map((p) => (
                                <li key={p.codigo}>
                                    {p.codigo} – {p.nombre}: <strong>{p.stock}</strong> {p.stock === 1 ? "unidad" : "unidades"}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
export default PanelResumen;
