import { createContext } from "react";
import type { DatosNuevoUsuario, ResultadoUsuario } from "../servicios/usuariosServicio";
import type { Rol, UsuarioSesion } from "../tipos/Usuario";

// Estado GLOBAL de la sesión: quién inició sesión y con qué rol.
// Se comparte con toda la app usando Context, para no pasar el usuario por props en cada nivel.
export interface ValorSesion {
    usuario: UsuarioSesion | null;
    iniciarSesion: (correo: string, clave: string) => ResultadoUsuario;
    registrar: (datos: Omit<DatosNuevoUsuario, "rol">) => ResultadoUsuario;
    cerrarSesion: () => void;
    tieneRol: (...roles: Rol[]) => boolean;
}

export const SesionContexto = createContext<ValorSesion | null>(null);
