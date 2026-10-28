import { useState } from "react";
import { useSesion } from "../../contexto/useSesion";
import { usuariosServicio } from "../../servicios/usuariosServicio";
import type { DatosNuevoUsuario } from "../../servicios/usuariosServicio";
import type { UsuarioSesion } from "../../tipos/Usuario";
import Alerta from "../../componentes/atomos/Alerta";
import FormularioUsuario from "../../componentes/organismos/FormularioUsuario";
import TablaUsuarios from "../../componentes/organismos/TablaUsuarios";

type Mensaje = { texto: string; tipo: "success" | "danger" };

// Módulo exigido por el caso: crear, editar, desactivar usuarios y asignar roles (solo Administrador)
function AdminUsuarios() {
    const { usuario } = useSesion();
    const [usuarios, setUsuarios] = useState<UsuarioSesion[]>(() => usuariosServicio.obtenerTodos());
    const [editando, setEditando] = useState<UsuarioSesion | null>(null);
    const [mensaje, setMensaje] = useState<Mensaje>({ texto: "", tipo: "success" });

    const guardar = (datos: DatosNuevoUsuario) => {
        if (editando && editando.id === usuario?.id && datos.rol !== editando.rol) {
            setMensaje({ texto: "No puedes cambiar tu propio rol (perderías el acceso al panel).", tipo: "danger" });
            return;
        }
        const resultado = editando ? usuariosServicio.actualizar(editando.id, datos) : usuariosServicio.crear(datos);
        setMensaje({ texto: resultado.mensaje, tipo: resultado.ok ? "success" : "danger" });
        if (resultado.ok) {
            setEditando(null);
            setUsuarios(usuariosServicio.obtenerTodos());
        }
    };

    const cambiarEstado = (id: number, activo: boolean) => {
        if (id === usuario?.id) {
            setMensaje({ texto: "No puedes desactivar tu propia cuenta.", tipo: "danger" });
            return;
        }
        const resultado = usuariosServicio.cambiarEstado(id, activo);
        setMensaje({ texto: resultado.mensaje, tipo: resultado.ok ? "success" : "danger" });
        setUsuarios(usuariosServicio.obtenerTodos());
    };

    return (
        <>
            <h1 className="h3 mb-3">Usuarios</h1>
            <Alerta texto={mensaje.texto} tipo={mensaje.tipo} alCerrar={() => setMensaje({ ...mensaje, texto: "" })} />
            <div className="row g-4">
                <div className="col-12 col-xl-4">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="h5 mb-3">{editando ? "Editar usuario" : "Nuevo usuario"}</h2>
                            <FormularioUsuario
                                key={editando ? editando.id : "nuevo"}
                                modo="admin"
                                usuarioInicial={editando ?? undefined}
                                alGuardar={guardar}
                                alCancelar={editando ? () => setEditando(null) : undefined}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-xl-8">
                    <div className="card">
                        <div className="card-body">
                            <TablaUsuarios
                                usuarios={usuarios}
                                idUsuarioActual={usuario?.id ?? 0}
                                alEditar={setEditando}
                                alCambiarEstado={cambiarEstado}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default AdminUsuarios;
