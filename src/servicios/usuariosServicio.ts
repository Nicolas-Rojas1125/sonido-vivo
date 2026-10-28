import { usuariosIniciales } from "../datos/usuarios";
import type { Rol, Usuario, UsuarioSesion } from "../tipos/Usuario";
import { formatearRut, limpiarRut } from "../utilidades/validaciones";
import { almacenamiento, CLAVES } from "./almacenamiento";

export interface ResultadoUsuario {
    ok: boolean;
    mensaje: string;
    usuario?: UsuarioSesion;
}

export interface DatosNuevoUsuario {
    rut: string;
    nombre: string;
    correo: string;
    clave: string;
    rol: Rol;
}

function copiarIniciales(): Usuario[] {
    return usuariosIniciales.map((usuario) => ({ ...usuario }));
}

let usuarios: Usuario[] = almacenamiento.leer<Usuario[]>(CLAVES.usuarios, copiarIniciales());

function persistir(): void {
    almacenamiento.guardar(CLAVES.usuarios, usuarios);
}

// Quita la clave antes de entregar el usuario a la interfaz
export function sinClave(usuario: Usuario): UsuarioSesion {
    return {
        id: usuario.id,
        rut: usuario.rut,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        activo: usuario.activo,
    };
}

function normalizarCorreo(correo: string): string {
    return correo.trim().toLowerCase();
}

// Servicio de usuarios (simula el futuro microservicio /api/usuarios y /api/auth)
export const usuariosServicio = {
    obtenerTodos(): UsuarioSesion[] {
        return usuarios.map(sinClave);
    },

    obtenerPorId(id: number): UsuarioSesion | undefined {
        const encontrado = usuarios.find((usuario) => usuario.id === id);
        return encontrado ? sinClave(encontrado) : undefined;
    },

    autenticar(correo: string, clave: string): ResultadoUsuario {
        const usuario = usuarios.find((u) => u.correo === normalizarCorreo(correo));
        if (!usuario || usuario.clave !== clave) {
            return { ok: false, mensaje: "Correo o contraseña incorrectos." };
        }
        if (!usuario.activo) {
            return { ok: false, mensaje: "Tu cuenta está desactivada. Contacta a la tienda." };
        }
        return { ok: true, mensaje: "Bienvenido/a, " + usuario.nombre + ".", usuario: sinClave(usuario) };
    },

    crear(datos: DatosNuevoUsuario): ResultadoUsuario {
        const correo = normalizarCorreo(datos.correo);
        const rut = limpiarRut(datos.rut);

        if (usuarios.some((u) => u.correo === correo)) {
            return { ok: false, mensaje: "Ya existe una cuenta con ese correo." };
        }
        if (usuarios.some((u) => limpiarRut(u.rut) === rut)) {
            return { ok: false, mensaje: "Ya existe una cuenta con ese RUT." };
        }

        const siguienteId = usuarios.reduce((max, u) => Math.max(max, u.id), 0) + 1;
        const nuevo: Usuario = {
            id: siguienteId,
            rut: formatearRut(datos.rut),
            nombre: datos.nombre.trim(),
            correo,
            clave: datos.clave,
            rol: datos.rol,
            activo: true,
        };
        usuarios = [...usuarios, nuevo];
        persistir();
        return { ok: true, mensaje: "Usuario " + nuevo.nombre + " creado correctamente.", usuario: sinClave(nuevo) };
    },

    // Si "clave" viene vacía, se mantiene la contraseña actual
    actualizar(id: number, datos: DatosNuevoUsuario): ResultadoUsuario {
        const actual = usuarios.find((u) => u.id === id);
        if (!actual) {
            return { ok: false, mensaje: "El usuario no existe." };
        }
        const correo = normalizarCorreo(datos.correo);
        if (usuarios.some((u) => u.id !== id && u.correo === correo)) {
            return { ok: false, mensaje: "Ya existe otra cuenta con ese correo." };
        }
        if (usuarios.some((u) => u.id !== id && limpiarRut(u.rut) === limpiarRut(datos.rut))) {
            return { ok: false, mensaje: "Ya existe otra cuenta con ese RUT." };
        }

        const actualizado: Usuario = {
            ...actual,
            rut: formatearRut(datos.rut),
            nombre: datos.nombre.trim(),
            correo,
            rol: datos.rol,
            clave: datos.clave !== "" ? datos.clave : actual.clave,
        };
        usuarios = usuarios.map((u) => (u.id === id ? actualizado : u));
        persistir();
        return { ok: true, mensaje: "Usuario " + actualizado.nombre + " actualizado.", usuario: sinClave(actualizado) };
    },

    cambiarEstado(id: number, activo: boolean): ResultadoUsuario {
        const actual = usuarios.find((u) => u.id === id);
        if (!actual) {
            return { ok: false, mensaje: "El usuario no existe." };
        }
        usuarios = usuarios.map((u) => (u.id === id ? { ...u, activo } : u));
        persistir();
        return {
            ok: true,
            mensaje: "Usuario " + actual.nombre + (activo ? " activado." : " desactivado."),
        };
    },

    reiniciar(): void {
        usuarios = copiarIniciales();
        persistir();
    },
};
