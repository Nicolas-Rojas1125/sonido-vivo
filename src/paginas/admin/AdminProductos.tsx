import { useState } from "react";
import { productosServicio } from "../../servicios/productosServicio";
import { useCargar } from "../../servicios/useCargar";
import type { Producto } from "../../tipos/Producto";
import Alerta from "../../componentes/atomos/Alerta";
import EstadoCarga from "../../componentes/moleculas/EstadoCarga";
import FormularioProducto from "../../componentes/organismos/FormularioProducto";
import TablaProductos from "../../componentes/organismos/TablaProductos";

type Mensaje = { texto: string; tipo: "success" | "danger" };

function AdminProductos() {
    // GET /api/productos; después de crear, editar o eliminar se vuelve a cargar
    const consulta = useCargar(() => productosServicio.listar());
    const productos = consulta.datos ?? [];
    const [procesando, setProcesando] = useState(false);
    const [editando, setEditando] = useState<Producto | null>(null);
    const [mensaje, setMensaje] = useState<Mensaje>({ texto: "", tipo: "success" });

    // POST (nuevo) o PUT (editar) en ms-tienda. Solo el Administrador (el backend responde 403 a otros roles).
    const guardar = async (producto: Producto) => {
        setProcesando(true);
        const resultado = editando
            ? await productosServicio.actualizar(editando.codigo, producto)
            : await productosServicio.crear(producto);
        setProcesando(false);

        setMensaje({ texto: resultado.mensaje, tipo: resultado.ok ? "success" : "danger" });
        if (resultado.ok) {
            setEditando(null);
            consulta.recargar();
        }
    };

    // DELETE /api/productos/{codigo}
    const eliminar = async (codigo: string) => {
        if (!window.confirm("¿Eliminar el producto " + codigo + "? Esta acción no se puede deshacer.")) {
            return;
        }
        const resultado = await productosServicio.eliminar(codigo);
        setMensaje({ texto: resultado.mensaje, tipo: resultado.ok ? "success" : "danger" });
        if (editando?.codigo === codigo) {
            setEditando(null);
        }
        consulta.recargar();
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
                                alGuardar={(producto) => void guardar(producto)}
                                alCancelar={editando ? () => setEditando(null) : undefined}
                                procesando={procesando}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-xl-8">
                    <div className="card">
                        <div className="card-body">
                            <EstadoCarga cargando={consulta.cargando} error={consulta.error} alReintentar={consulta.recargar} texto="Cargando productos..." />
                            {consulta.datos && (
                                <>
                                    <p className="small text-body-secondary">{productos.length} productos en el catálogo</p>
                                    <TablaProductos productos={productos} alEditar={setEditando} alEliminar={(codigo) => void eliminar(codigo)} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default AdminProductos;
