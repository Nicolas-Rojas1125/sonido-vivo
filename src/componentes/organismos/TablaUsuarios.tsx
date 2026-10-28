import type { UsuarioSesion } from "../../tipos/Usuario";
import FilaUsuario from "../moleculas/FilaUsuario";

type Props = {
    usuarios: UsuarioSesion[];
    idUsuarioActual: number;
    alEditar: (usuario: UsuarioSesion) => void;
    alCambiarEstado: (id: number, activo: boolean) => void;
};

function TablaUsuarios({ usuarios, idUsuarioActual, alEditar, alCambiarEstado }: Props) {
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle">
                <caption className="visually-hidden">Usuarios del sistema</caption>
                <thead>
                    <tr>
                        <th scope="col">Nombre</th>
                        <th scope="col" className="d-none d-md-table-cell">Correo</th>
                        <th scope="col" className="d-none d-lg-table-cell">RUT</th>
                        <th scope="col">Rol</th>
                        <th scope="col">Estado</th>
                        <th scope="col" className="text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => (
                        <FilaUsuario
                            key={usuario.id}
                            usuario={usuario}
                            esUsuarioActual={usuario.id === idUsuarioActual}
                            alEditar={alEditar}
                            alCambiarEstado={alCambiarEstado}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default TablaUsuarios;
