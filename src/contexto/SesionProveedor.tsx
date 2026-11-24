import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { configurarRenovacion } from "../servicios/api";
import { authServicio } from "../servicios/authServicio";
import type { DatosRegistro } from "../servicios/authServicio";
import type { Rol, UsuarioSesion } from "../tipos/Usuario";
import { SesionContexto } from "./SesionContexto";
import type { ValorSesion } from "./SesionContexto";

type Props = {
    children: ReactNode;
};

// GESTIÓN DE SESIÓN EN EL FRONTEND
//  - El access token (JWT) vive SOLO en memoria (api.ts). No se guarda en localStorage.
//  - El refresh token vive en una cookie httpOnly que JavaScript no puede leer.
//  - Al abrir o RECARGAR la página se llama a /auth/refresh: si la cookie es válida,
//    el backend entrega un token nuevo y los datos REALES del usuario (rol incluido).
//    Así la sesión persiste al recargar y nadie puede "darse" otro rol editando el navegador.
//  - Si el token expira mientras se usa la app, api.ts lo renueva automáticamente;
//    si ya no se puede renovar, se cierra la sesión y se avisa.
function SesionProveedor({ children }: Props) {
    const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
    const [cargando, setCargando] = useState(true);
    const [aviso, setAviso] = useState("");

    useEffect(() => {
        let vigente = true;

        // api.ts usará estas funciones cuando reciba un 401
        configurarRenovacion(
            async () => {
                const renovado = await authServicio.renovar();
                if (vigente && renovado) setUsuario(renovado); // rol actualizado desde el servidor
                return renovado !== null;
            },
            () => {
                if (!vigente) return;
                setUsuario(null);
                setAviso("Tu sesión expiró. Inicia sesión nuevamente.");
            }
        );

        // Restaurar la sesión al cargar la página
        authServicio
            .renovar()
            .then((restaurado) => {
                if (vigente) setUsuario(restaurado);
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });

        return () => {
            vigente = false;
            configurarRenovacion(null, null);
        };
    }, []);

    const valor: ValorSesion = {
        usuario,
        cargando,
        aviso,
        iniciarSesion: async (correo, clave) => {
            const resultado = await authServicio.iniciarSesion(correo, clave);
            if (resultado.ok && resultado.usuario) {
                setAviso("");
                setUsuario(resultado.usuario);
            }
            return resultado;
        },
        registrar: async (datos: DatosRegistro) => {
            // El registro público siempre crea usuarios con rol Cliente (lo decide el backend)
            const resultado = await authServicio.registrar(datos);
            if (resultado.ok && resultado.usuario) {
                setAviso("");
                setUsuario(resultado.usuario);
            }
            return resultado;
        },
        cerrarSesion: async () => {
            setUsuario(null); // primero en la interfaz (inmediato), luego en el servidor
            await authServicio.cerrarSesion();
        },
        tieneRol: (...roles: Rol[]) => usuario !== null && roles.includes(usuario.rol),
    };

    return <SesionContexto.Provider value={valor}>{children}</SesionContexto.Provider>;
}
export default SesionProveedor;
