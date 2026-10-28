import { useState } from "react";
import { productosServicio } from "../../servicios/productosServicio";
import type { Producto } from "../../tipos/Producto";
import { filtrarProductos } from "../../utilidades/filtros";
import { obtenerEstadoStock } from "../../utilidades/stock";
import Alerta from "../../componentes/atomos/Alerta";
import CampoFormulario from "../../componentes/moleculas/CampoFormulario";
import TablaInventario from "../../componentes/organismos/TablaInventario";

function AdminInventario() {
    const [productos, setProductos] = useState<Producto[]>(() => productosServicio.obtenerTodos());
    const [busqueda, setBusqueda] = useState("");
    const [soloCriticos, setSoloCriticos] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: "", tipo: "success" as "success" | "danger" });

    let visibles = filtrarProductos(productos, "todos", busqueda);
    if (soloCriticos) {
        visibles = visibles.filter((p) => obtenerEstadoStock(p.stock) !== "disponible");
    }

    const guardarStock = (codigo: string, stock: number) => {
        const resultado = productosServicio.actualizarStock(codigo, stock);
        setMensaje({ texto: resultado.mensaje, tipo: resultado.ok ? "success" : "danger" });
        setProductos(productosServicio.obtenerTodos());
    };

    return (
        <>
            <h1 className="h3 mb-3">Inventario</h1>
            <p className="text-body-secondary">Actualiza el stock cuando llegue mercadería. Las ventas online lo descuentan automáticamente.</p>
            <div className="row g-3 align-items-center">
                <div className="col-12 col-md-7">
                    <CampoFormulario etiqueta="Buscar producto" tipo="search" nombre="buscar-inventario" valor={busqueda} alCambiar={setBusqueda} placeholder="Nombre, marca, modelo o código" />
                </div>
                <div className="col-12 col-md-5">
                    <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" role="switch" id="solo-criticos" checked={soloCriticos} onChange={(e) => setSoloCriticos(e.target.checked)} />
                        <label className="form-check-label" htmlFor="solo-criticos">
                            Mostrar solo stock crítico
                        </label>
                    </div>
                </div>
            </div>
            <Alerta texto={mensaje.texto} tipo={mensaje.tipo} alCerrar={() => setMensaje({ ...mensaje, texto: "" })} />
            <div className="card">
                <div className="card-body">
                    <TablaInventario productos={visibles} alGuardarStock={guardarStock} />
                </div>
            </div>
        </>
    );
}
export default AdminInventario;
