import { useState } from "react";
import { useSesion } from "../../contexto/useSesion";
import { usuariosServicio } from "../../servicios/usuariosServicio";
import { useCargar } from "../../servicios/useCargar";
import type { DatosNuevoUsuario } from "../../servicios/usuariosServicio";
import type { UsuarioSesion } from "../../tipos/Usuario";
import Alerta from "../../componentes/atomos/Alerta";
import EstadoCarga from "../../componentes/moleculas/EstadoCarga";
import FormularioUsuario from "../../componentes/organismos/FormularioUsuario";
import TablaUsuarios from "../../componentes/organismos/TablaUsuarios";

type Mensaje = { texto: string; tipo: "success" | "danger" };

// Módulo exigido por el caso: crear, editar, desactivar usuarios y asignar roles (solo Administrador)
function AdminUsuarios() {
    const { usuario } = useSesion();
    // GET /api/usuarios (ms-usuarios, solo Administrador)
    const consulta = useCargar(() => usuariosServicio.listar());
    const usuarios = consulta.datos ?? [];
    const [procesando, setProcesando] = useState(false);
    const [editando, setEditando] = useState<UsuarioSesion | null>(null);
    const [mensaje, setMensaje] = useState<Mensaje>({ texto: "", tipo: "success" });

    // POST /api/usuarios (nuevo) o PUT /api/usuarios/{id} (editar y asignar rol)
    const guardar = async (datos: DatosNuevoUsuario) => {
        if (editando && editando.id === usuario?.id && datos.rol !== editando.rol) {
            setMensaje({ texto: "No puedes cambiar tu propio rol (perderías el acceso al panel).", tipo: "danger" });
            return;
        }
        setProcesando(true);
        const resultado = editando ? await usuariosServicio.actualizar(editando.id, datos) : await usuariosServicio.crear(datos);
        setProcesando(false);
        setMensaje({ texto: resultado.mensaje, tipo: resultado.ok ? "success" : "danger" });
        if (resultado.ok) {
            setEditando(null);
            consulta.recargar();
        }
    };

    // PATCH /api/usuarios/{id}/estado (el backend también cierra las sesiones del usuario desactivado)
    const cambiarEstado = async (id: number, activo: boolean) => {
        if (id === usuario?.id) {
            setMensaje({ texto: "No puedes desactivar tu propia cuenta.", tipo: "danger" });
            return;
        }
        const resultado = await usuariosServicio.cambiarEstado(id, activo);
        setMensaje({ texto: resultado.mensaje, tipo: resultado.ok ? "success" : "danger" });
        consulta.recargar();
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
                                alGuardar={(datos) => void guardar(datos)}
                                alCancelar={editando ? () => setEditando(null) : undefined}
                                procesando={procesando}
                            />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-xl-8">
                    <div className="card">
                        <div className="card-body">
                            <EstadoCarga cargando={consulta.cargando} error={consulta.error} alReintentar={consulta.recargar} texto="Cargando usuarios..." />
                            {consulta.datos && (
                                <TablaUsuarios
                                    usuarios={usuarios}
                                    idUsuarioActual={usuario?.id ?? 0}
                                    alEditar={setEditando}
                                    alCambiarEstado={(id, activo) => void cambiarEstado(id, activo)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default AdminUsuarios;
