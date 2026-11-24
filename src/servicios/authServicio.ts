// Servicio de autenticación: se comunica con ms-usuarios (/api/auth).
//
//   POST /auth/login    -> access token (JWT) en el JSON + refresh token en cookie httpOnly
//   POST /auth/registro -> igual que login, creando una cuenta de CLIENTE
//   POST /auth/refresh  -> nuevo access token usando la cookie (al recargar o cuando el token expira)
//   POST /auth/logout   -> revoca el refresh token y borra la cookie
//
// credentials: "include" hace que el navegador envíe y reciba la cookie del refresh token
// aunque el frontend (puerto 5173) y ms-usuarios (puerto 8081) estén en orígenes distintos.

import type { Rol, UsuarioSesion } from "../tipos/Usuario";
import { ErrorApi, peticion, tokenEnMemoria, URL_USUARIOS } from "./api";

// Usuario tal como lo devuelve el backend (rol en MAYÚSCULAS)
export interface UsuarioApi {
    id: number;
    rut: string;
    nombre: string;
    correo: string;
    rol: "ADMINISTRADOR" | "VENDEDOR" | "CLIENTE";
    activo: boolean;
}

interface SesionApi {
    accessToken: string;
    tipo: string;
    expiraEnSegundos: number;
    usuario: UsuarioApi;
}

export interface ResultadoSesion {
    ok: boolean;
    mensaje: string;
    usuario?: UsuarioSesion;
}

export interface DatosRegistro {
    rut: string;
    nombre: string;
    correo: string;
    clave: string;
}

// "ADMINISTRADOR" -> "administrador" (los componentes usan los roles en minúscula)
export function rolDesdeApi(rol: string): Rol {
    return rol.toLowerCase() as Rol;
}

export function rolHaciaApi(rol: Rol): UsuarioApi["rol"] {
    return rol.toUpperCase() as UsuarioApi["rol"];
}

export function usuarioDesdeApi(u: UsuarioApi): UsuarioSesion {
    return { id: u.id, rut: u.rut, nombre: u.nombre, correo: u.correo, rol: rolDesdeApi(u.rol), activo: u.activo };
}

function guardarSesion(sesion: SesionApi): UsuarioSesion {
    tokenEnMemoria.guardar(sesion.accessToken);
    return usuarioDesdeApi(sesion.usuario);
}

// Una sola renovación a la vez: si varias peticiones reciben 401 al mismo tiempo (o React
// ejecuta dos veces el efecto en modo estricto), todas esperan la MISMA renovación.
// Esto es importante porque el refresh token se rota: usarlo dos veces cerraría la sesión.
let renovacionEnCurso: Promise<UsuarioSesion | null> | null = null;

export const authServicio = {
    async iniciarSesion(correo: string, clave: string): Promise<ResultadoSesion> {
        try {
            const sesion = await peticion<SesionApi>(URL_USUARIOS + "/auth/login", {
                method: "POST",
                body: JSON.stringify({ correo: correo.trim(), clave }),
                credentials: "include",
                conToken: false,
            });
            const usuario = guardarSesion(sesion);
            return { ok: true, mensaje: "Bienvenido/a, " + usuario.nombre + ".", usuario };
        } catch (error) {
            return { ok: false, mensaje: error instanceof ErrorApi ? error.message : "No se pudo iniciar sesión." };
        }
    },

    async registrar(datos: DatosRegistro): Promise<ResultadoSesion> {
        try {
            const sesion = await peticion<SesionApi>(URL_USUARIOS + "/auth/registro", {
                method: "POST",
                body: JSON.stringify(datos),
                credentials: "include",
                conToken: false,
            });
            const usuario = guardarSesion(sesion);
            return { ok: true, mensaje: "Cuenta creada. ¡Bienvenido/a, " + usuario.nombre + "!", usuario };
        } catch (error) {
            return { ok: false, mensaje: error instanceof ErrorApi ? error.message : "No se pudo crear la cuenta." };
        }
    },

    // Pide un access token nuevo con la cookie del refresh token.
    // Devuelve el usuario si la sesión sigue válida, o null si no hay sesión (o expiró).
    renovar(): Promise<UsuarioSesion | null> {
        if (!renovacionEnCurso) {
            renovacionEnCurso = peticion<SesionApi>(URL_USUARIOS + "/auth/refresh", {
                method: "POST",
                credentials: "include",
                conToken: false,
            })
                .then(guardarSesion)
                .catch(() => {
                    tokenEnMemoria.limpiar();
                    return null;
                })
                .finally(() => {
                    renovacionEnCurso = null;
                });
        }
        return renovacionEnCurso;
    },

    async cerrarSesion(): Promise<void> {
        tokenEnMemoria.limpiar();
        try {
            await peticion<void>(URL_USUARIOS + "/auth/logout", { method: "POST", credentials: "include", conToken: false });
        } catch {
            // Aunque el servidor no responda, la sesión se cierra en el navegador
        }
    },
};
