// =====================================================================
// CLIENTE HTTP DE LA APLICACIÓN
// Todas las peticiones a los microservicios pasan por aquí. Se encarga de:
//  1) Agregar el header "Authorization: Bearer <token>" (el JWT guardado EN MEMORIA).
//  2) Si el backend responde 401 (token expirado), renovar el token UNA vez con el
//     refresh token (cookie httpOnly) y repetir la petición automáticamente.
//  3) Si no se puede renovar, avisar que la sesión expiró y seguir como invitado.
//     (Un invitado no envía token: si recibe 401 no hay nada que renovar.)
//  4) Convertir los errores del backend { "mensaje": "..." } en un ErrorApi con ese texto.
// =====================================================================

// Direcciones de los microservicios (puertos definidos en cada application.properties)
export const URL_USUARIOS = "http://localhost:8081/api";
export const URL_CONTACTOS = "http://localhost:8082/api";
export const URL_TIENDA = "http://localhost:8083/api";

export class ErrorApi extends Error {
    estado: number; // código HTTP (0 = no hubo respuesta: servidor apagado o sin red)
    errores: Record<string, string>; // errores por campo (validaciones @Valid del backend)

    constructor(estado: number, mensaje: string, errores: Record<string, string> = {}) {
        super(mensaje);
        this.name = "ErrorApi";
        this.estado = estado;
        this.errores = errores;
    }
}

export const MENSAJE_SIN_CONEXION =
    "No se pudo conectar con el servidor. Revisa que los microservicios y MySQL estén encendidos.";

// Texto para mostrar al usuario a partir de cualquier error
export function mensajeDeError(error: unknown, porDefecto = "Ocurrió un error inesperado. Intenta nuevamente."): string {
    return error instanceof ErrorApi ? error.message : porDefecto;
}

// ---------------------------------------------------------------------
// Token de acceso: SOLO en memoria (una variable), nunca en localStorage.
// Si un script malicioso (XSS) lee localStorage, no encuentra el token.
// Al recargar la página la variable se pierde, y la sesión se recupera con el
// refresh token (cookie httpOnly que JavaScript no puede leer).
// ---------------------------------------------------------------------
let tokenAcceso: string | null = null;

export const tokenEnMemoria = {
    obtener: (): string | null => tokenAcceso,
    guardar: (token: string): void => {
        tokenAcceso = token;
    },
    limpiar: (): void => {
        tokenAcceso = null;
    },
};

// Funciones que registra el servicio de autenticación (así este archivo no depende de él)
type Renovador = () => Promise<boolean>;
let renovador: Renovador | null = null;
let alExpirarSesion: (() => void) | null = null;

export function configurarRenovacion(renovar: Renovador | null, alExpirar: (() => void) | null): void {
    renovador = renovar;
    alExpirarSesion = alExpirar;
}

type Opciones = RequestInit & {
    conToken?: boolean; // false en login, registro y refresh
};

function armarHeaders(opciones: Opciones): Record<string, string> {
    const headers: Record<string, string> = {};
    if (opciones.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }
    const token = tokenEnMemoria.obtener();
    if (opciones.conToken !== false && token) {
        headers["Authorization"] = "Bearer " + token;
    }
    return headers;
}

async function crearError(respuesta: Response): Promise<ErrorApi> {
    let cuerpo: { mensaje?: string; errores?: Record<string, string> } = {};
    try {
        cuerpo = (await respuesta.json()) ?? {}; // el cuerpo puede venir vacío o ser "null"
    } catch {
        // respuesta sin cuerpo JSON (ej: 401/403 de Spring Security)
    }
    const porEstado: Record<number, string> = {
        401: "Tu sesión expiró. Inicia sesión nuevamente.",
        403: "No tienes permisos para realizar esta acción.",
        404: "El recurso solicitado no existe.",
    };
    const mensaje = cuerpo.mensaje ?? porEstado[respuesta.status] ?? `Error del servidor (HTTP ${respuesta.status}).`;
    return new ErrorApi(respuesta.status, mensaje, cuerpo.errores ?? {});
}

async function ejecutar(url: string, opciones: Opciones): Promise<Response> {
    const { conToken: _conToken, ...init } = opciones;
    void _conToken;
    try {
        return await fetch(url, { ...init, headers: { ...armarHeaders(opciones), ...(init.headers as Record<string, string>) } });
    } catch {
        throw new ErrorApi(0, MENSAJE_SIN_CONEXION);
    }
}

// Petición genérica: devuelve el JSON de la respuesta (o undefined si es 204 No Content)
export async function peticion<T>(url: string, opciones: Opciones = {}): Promise<T> {
    // Se revisa ANTES de enviar: si había token, un 401 significa que expiró
    const habiaToken = opciones.conToken !== false && tokenEnMemoria.obtener() !== null;
    let respuesta = await ejecutar(url, opciones);

    // 401 con token: probablemente expiró -> se renueva y se reintenta UNA sola vez.
    // Si no se puede renovar, el token ya se borró de memoria: se reintenta como INVITADO
    // (así el catálogo y el contacto, que son públicos, siguen funcionando) y se avisa que la sesión expiró.
    if (respuesta.status === 401 && habiaToken && renovador) {
        const renovado = await renovador();
        if (!renovado) {
            alExpirarSesion?.();
        }
        respuesta = await ejecutar(url, opciones);
    }

    if (!respuesta.ok) {
        throw await crearError(respuesta);
    }
    if (respuesta.status === 204) {
        return undefined as T;
    }
    const texto = await respuesta.text();
    return (texto ? JSON.parse(texto) : undefined) as T;
}

// Atajos para enviar JSON
export const api = {
    get: <T>(url: string) => peticion<T>(url),
    post: <T>(url: string, cuerpo?: unknown, opciones: Opciones = {}) =>
        peticion<T>(url, { ...opciones, method: "POST", body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) }),
    put: <T>(url: string, cuerpo?: unknown) =>
        peticion<T>(url, { method: "PUT", body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) }),
    patch: <T>(url: string, cuerpo: unknown) => peticion<T>(url, { method: "PATCH", body: JSON.stringify(cuerpo) }),
    delete: <T>(url: string) => peticion<T>(url, { method: "DELETE" }),
};
