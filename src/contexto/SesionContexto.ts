import { createContext } from "react";
import type { DatosRegistro, ResultadoSesion } from "../servicios/authServicio";
import type { Rol, UsuarioSesion } from "../tipos/Usuario";

// Estado GLOBAL de la sesión: quién inició sesión y con qué rol.
// Se comparte con toda la app usando Context, para no pasar el usuario por props en cada nivel.
export interface ValorSesion {
    usuario: UsuarioSesion | null;
    // true mientras se comprueba con el backend si hay una sesión guardada (al abrir o recargar la página)
    cargando: boolean;
    // Mensaje cuando la sesión expiró o fue cerrada desde el servidor
    aviso: string;
    iniciarSesion: (correo: string, clave: string) => Promise<ResultadoSesion>;
    registrar: (datos: DatosRegistro) => Promise<ResultadoSesion>;
    cerrarSesion: () => Promise<void>;
    tieneRol: (...roles: Rol[]) => boolean;
}

export const SesionContexto = createContext<ValorSesion | null>(null);
