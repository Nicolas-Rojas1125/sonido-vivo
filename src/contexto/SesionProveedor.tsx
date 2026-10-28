import { useState } from "react";
import type { ReactNode } from "react";
import { almacenamiento, CLAVES } from "../servicios/almacenamiento";
import { usuariosServicio } from "../servicios/usuariosServicio";
import type { DatosNuevoUsuario } from "../servicios/usuariosServicio";
import type { Rol, UsuarioSesion } from "../tipos/Usuario";
import { SesionContexto } from "./SesionContexto";
import type { ValorSesion } from "./SesionContexto";

type Props = {
    children: ReactNode;
};

function SesionProveedor({ children }: Props) {
    // Estado inicial: la sesión guardada en el navegador, VALIDADA contra los usuarios registrados.
    // Así, si alguien edita localStorage para cambiar su rol, o si su cuenta fue desactivada,
    // se usan los datos reales (o se cierra la sesión).
    const [usuario, setUsuario] = useState<UsuarioSesion | null>(() => {
        const guardada = almacenamiento.leer<UsuarioSesion | null>(CLAVES.sesion, null);
        if (!guardada) {
            return null;
        }
        const real = usuariosServicio.obtenerPorId(guardada.id);
        return real && real.activo && real.correo === guardada.correo ? real : null;
    });

    const guardarSesion = (nuevo: UsuarioSesion | null) => {
        setUsuario(nuevo);
        if (nuevo) {
            almacenamiento.guardar(CLAVES.sesion, nuevo);
        } else {
            almacenamiento.eliminar(CLAVES.sesion);
        }
    };

    const valor: ValorSesion = {
        usuario,
        iniciarSesion: (correo, clave) => {
            const resultado = usuariosServicio.autenticar(correo, clave);
            if (resultado.ok && resultado.usuario) {
                guardarSesion(resultado.usuario);
            }
            return resultado;
        },
        registrar: (datos: Omit<DatosNuevoUsuario, "rol">) => {
            // El registro público siempre crea usuarios con rol Cliente
            const resultado = usuariosServicio.crear({ ...datos, rol: "cliente" });
            if (resultado.ok && resultado.usuario) {
                guardarSesion(resultado.usuario);
            }
            return resultado;
        },
        cerrarSesion: () => guardarSesion(null),
        tieneRol: (...roles: Rol[]) => usuario !== null && roles.includes(usuario.rol),
    };

    return <SesionContexto.Provider value={valor}>{children}</SesionContexto.Provider>;
}
export default SesionProveedor;
