import { useState } from "react";
import { Link } from "react-router-dom";
import { useSesion } from "../../contexto/useSesion";
import { etiquetasEstadoPedido, ordenEstados } from "../../datos/pedidos";
import { pedidosServicio } from "../../servicios/pedidosServicio";
import { productosServicio } from "../../servicios/productosServicio";
import { usuariosServicio } from "../../servicios/usuariosServicio";
import { formatearPrecio } from "../../utilidades/formato";
import { obtenerEstadoStock } from "../../utilidades/stock";
import Alerta from "../../componentes/atomos/Alerta";
import Boton from "../../componentes/atomos/Boton";
import TarjetaResumen from "../../componentes/moleculas/TarjetaResumen";

function PanelResumen() {
    const { tieneRol } = useSesion();
    const [mensaje, setMensaje] = useState("");
    // "version" fuerza a volver a leer los datos después de restablecerlos
    const [version, setVersion] = useState(0);

    const resumen = pedidosServicio.obtenerResumen();
    const productos = productosServicio.obtenerTodos();
    const criticos = productos.filter((p) => obtenerEstadoStock(p.stock) !== "disponible");

    const restablecer = () => {
        productosServicio.reiniciar();
        pedidosServicio.reiniciar();
        usuariosServicio.reiniciar();
        setVersion(version + 1);
        setMensaje("Se restablecieron los datos de demostración (catálogo, pedidos y usuarios).");
    };

    return (
        <div key={version}>
            <h1 className="h3 mb-4">Resumen de la tienda</h1>
            <Alerta texto={mensaje} alCerrar={() => setMensaje("")} />

            <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
                <div className="col">
                    <TarjetaResumen titulo="Ventas totales" valor={formatearPrecio(resumen.totalVentas)} detalle={resumen.cantidadPedidos + " pedidos"} />
                </div>
                {ordenEstados.map((estado) => (
                    <div className="col" key={estado}>
                        <TarjetaResumen
                            titulo={etiquetasEstadoPedido[estado]}
                            valor={String(resumen.porEstado[estado])}
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

            {tieneRol("administrador") && (
                <div className="card border-danger-subtle">
                    <div className="card-body">
                        <h2 className="h6">Datos de demostración</h2>
                        <p className="small text-body-secondary">
                            Los datos se guardan en el navegador (localStorage) hasta que exista el backend. Este botón vuelve al catálogo original del Excel.
                        </p>
                        <Boton texto="Restablecer datos" variante="outline-secondary" tamano="sm" alClick={restablecer} />
                    </div>
                </div>
            )}
        </div>
    );
}
export default PanelResumen;
