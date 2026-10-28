// Roles mínimos exigidos por el caso (sección 0.2 del documento Sonido Vivo)
export type Rol = "administrador" | "vendedor" | "cliente";

export interface Usuario {
    id: number;
    rut: string;
    nombre: string;
    correo: string;
    clave: string; // En el backend (Spring Boot) la clave se guardará encriptada (BCrypt). Aquí es solo una simulación.
    rol: Rol;
    activo: boolean;
}

// Usuario sin clave: es lo que se guarda en la sesión del navegador
export type UsuarioSesion = Omit<Usuario, "clave">;

export interface FormularioUsuarioDatos {
    rut: string;
    nombre: string;
    correo: string;
    clave: string;
    confirmarClave: string;
    rol: string;
}

export type ErroresUsuario = Partial<Record<keyof FormularioUsuarioDatos, string>>;

export interface DatosLogin {
    correo: string;
    clave: string;
}

export type ErroresLogin = Partial<Record<keyof DatosLogin, string>>;
