// Servicio de gestión de usuarios (solo Administrador): se comunica con ms-usuarios (/api/usuarios).
import type { Rol, UsuarioSesion } from "../tipos/Usuario";
import { api, mensajeDeError, URL_USUARIOS } from "./api";
import { rolHaciaApi, usuarioDesdeApi } from "./authServicio";
import type { UsuarioApi } from "./authServicio";

export interface ResultadoUsuario {
    ok: boolean;
    mensaje: string;
    usuario?: UsuarioSesion;
}

export interface DatosNuevoUsuario {
    rut: string;
    nombre: string;
    correo: string;
    clave: string; // al editar puede ir vacía: se mantiene la contraseña actual
    rol: Rol;
}

const URL = URL_USUARIOS + "/usuarios";

function cuerpo(datos: DatosNuevoUsuario) {
    return { rut: datos.rut, nombre: datos.nombre.trim(), correo: datos.correo.trim(), clave: datos.clave, rol: rolHaciaApi(datos.rol) };
}

async function resultado(accion: () => Promise<UsuarioApi>, mensaje: (u: UsuarioSesion) => string): Promise<ResultadoUsuario> {
    try {
        const usuario = usuarioDesdeApi(await accion());
        return { ok: true, mensaje: mensaje(usuario), usuario };
    } catch (error) {
        return { ok: false, mensaje: mensajeDeError(error) };
    }
}

export const usuariosServicio = {
    // GET /api/usuarios
    async listar(): Promise<UsuarioSesion[]> {
        const lista = await api.get<UsuarioApi[]>(URL);
        return lista.map(usuarioDesdeApi);
    },

    // POST /api/usuarios
    crear(datos: DatosNuevoUsuario): Promise<ResultadoUsuario> {
        return resultado(() => api.post<UsuarioApi>(URL, cuerpo(datos)), (u) => "Usuario " + u.nombre + " creado correctamente.");
    },

    // PUT /api/usuarios/{id}
    actualizar(id: number, datos: DatosNuevoUsuario): Promise<ResultadoUsuario> {
        return resultado(() => api.put<UsuarioApi>(URL + "/" + id, cuerpo(datos)), (u) => "Usuario " + u.nombre + " actualizado.");
    },

    // PATCH /api/usuarios/{id}/estado
    cambiarEstado(id: number, activo: boolean): Promise<ResultadoUsuario> {
        return resultado(
            () => api.patch<UsuarioApi>(URL + "/" + id + "/estado", { activo }),
            (u) => "Usuario " + u.nombre + (activo ? " activado." : " desactivado.")
        );
    },
};
