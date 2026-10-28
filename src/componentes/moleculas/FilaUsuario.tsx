import { etiquetasRol } from "../../datos/usuarios";
import type { UsuarioSesion } from "../../tipos/Usuario";
import Boton from "../atomos/Boton";
import Insignia from "../atomos/Insignia";

type Props = {
    usuario: UsuarioSesion;
    esUsuarioActual: boolean;
    alEditar: (usuario: UsuarioSesion) => void;
    alCambiarEstado: (id: number, activo: boolean) => void;
};

function FilaUsuario({ usuario, esUsuarioActual, alEditar, alCambiarEstado }: Props) {
    return (
        <tr className={usuario.activo ? "" : "text-body-secondary"}>
            <td>
                {usuario.nombre}
                {esUsuarioActual && <span className="small text-body-secondary"> (tú)</span>}
                <div className="small text-body-secondary d-md-none">{usuario.correo}</div>
            </td>
            <td className="d-none d-md-table-cell">{usuario.correo}</td>
            <td className="d-none d-lg-table-cell">{usuario.rut}</td>
            <td>{etiquetasRol[usuario.rol]}</td>
            <td>
                <Insignia texto={usuario.activo ? "Activo" : "Inactivo"} color={usuario.activo ? "success" : "secondary"} />
            </td>
            <td>
                <div className="d-flex gap-2 justify-content-end">
                    <Boton texto="Editar" variante="warning" tamano="sm" alClick={() => alEditar(usuario)} />
                    <Boton
                        texto={usuario.activo ? "Desactivar" : "Activar"}
                        variante={usuario.activo ? "outline-secondary" : "success"}
                        tamano="sm"
                        deshabilitado={esUsuarioActual}
                        alClick={() => alCambiarEstado(usuario.id, !usuario.activo)}
                    />
                </div>
            </td>
        </tr>
    );
}
export default FilaUsuario;
