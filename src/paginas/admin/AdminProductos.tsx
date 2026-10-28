import { useState } from "react";
import { productosServicio } from "../../servicios/productosServicio";
import type { Producto } from "../../tipos/Producto";
import Alerta from "../../componentes/atomos/Alerta";
import FormularioProducto from "../../componentes/organismos/FormularioProducto";
import TablaProductos from "../../componentes/organismos/TablaProductos";

type Mensaje = { texto: string; tipo: "success" | "danger" };

function AdminProductos() {
    const [productos, setProductos] = useState<Producto[]>(() => productosServicio.obtenerTodos());
    const [editando, setEditando] = useState<Producto | null>(null);
    const [mensaje, setMensaje] = useState<Mensaje>({ texto: "", tipo: "success" });

    const recargar = () => setProductos(productosServicio.obtenerTodos());

    const guardar = (producto: Producto) => {
        const resultado = editando
            ? productosServicio.actualizar(editando.codigo, producto)
            : productosServicio.crear(producto);

        setMensaje({ texto: resultado.mensaje, tipo: resultado.ok ? "success" : "danger" });
        if (resultado.ok) {
            setEditando(null);
            recargar();
        }
    };

    const eliminar = (codigo: string) => {
        const resultado = productosServicio.eliminar(codigo);
        setMensaje({ texto: resultado.mensaje, tipo: resultado.ok ? "success" : "danger" });
        if (editando?.codigo === codigo) {
            setEditando(null);
        }
        recargar();
    };

    return (
        <>
            <h1 className="h3 mb-3">Productos</h1>
            <Alerta texto={mensaje.texto} tipo={mensaje.tipo} alCerrar={() => setMensaje({ ...mensaje, texto: "" })} />
            <div className="row g-4">
                <div className="col-12 col-xl-4">
                    <div className="card">
                        <div className="card-body">
                            {/* La key reinicia el formulario al cambiar entre "nuevo" y "editar" */}
                            <FormularioProducto
                                key={editando ? editando.codigo : "nuevo"}
                                productoInicial={editando ?? undefined}
                                alGuardar={guardar}
                                alCancelar={editando ? () => setEditando(null) : undefined}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-xl-8">
                    <div className="card">
                        <div className="card-body">
                            <p className="small text-body-secondary">{productos.length} productos en el catálogo</p>
                            <TablaProductos productos={productos} alEditar={setEditando} alEliminar={eliminar} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default AdminProductos;
