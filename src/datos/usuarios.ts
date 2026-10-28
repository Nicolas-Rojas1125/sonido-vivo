import type { Usuario } from "../tipos/Usuario";

// Usuarios de prueba (uno por cada rol del caso).
// Úsalos para iniciar sesión durante la presentación.
export const usuariosIniciales: Usuario[] = [
    {
        id: 1,
        rut: "11.111.111-1",
        nombre: "Dueño Sonido Vivo",
        correo: "admin@sonidovivo.cl",
        clave: "Admin123",
        rol: "administrador",
        activo: true,
    },
    {
        id: 2,
        rut: "12.345.678-5",
        nombre: "Vendedor Sonido Vivo",
        correo: "vendedor@sonidovivo.cl",
        clave: "Vende123",
        rol: "vendedor",
        activo: true,
    },
    {
        id: 3,
        rut: "9.876.543-3",
        nombre: "Cliente de Prueba",
        correo: "cliente@correo.cl",
        clave: "Cliente123",
        rol: "cliente",
        activo: true,
    },
];

export const etiquetasRol: Record<Usuario["rol"], string> = {
    administrador: "Administrador",
    vendedor: "Vendedor",
    cliente: "Cliente",
};

export const todosLosRoles: Usuario["rol"][] = ["administrador", "vendedor", "cliente"];

// Página a la que se envía a cada rol después de iniciar sesión
export const inicioPorRol: Record<Usuario["rol"], string> = {
    administrador: "/admin",
    vendedor: "/admin/pedidos",
    cliente: "/",
};

// Qué roles pueden entrar a cada sección (las mismas reglas que usa App.tsx con RutaProtegida)
const reglasDeAcceso: { prefijo: string; roles: Usuario["rol"][] }[] = [
    { prefijo: "/admin/productos", roles: ["administrador"] },
    { prefijo: "/admin/usuarios", roles: ["administrador"] },
    { prefijo: "/admin", roles: ["administrador", "vendedor"] },
    { prefijo: "/checkout", roles: ["cliente"] },
    { prefijo: "/mis-pedidos", roles: ["cliente"] },
];

export function puedeAcceder(ruta: string, rol: Usuario["rol"]): boolean {
    const camino = ruta.split("?")[0];
    const regla = reglasDeAcceso.find((r) => camino === r.prefijo || camino.startsWith(r.prefijo + "/"));
    return regla ? regla.roles.includes(rol) : true;
}

// Después del login: vuelve a la página que pedía, solo si el rol tiene permiso para verla
export function destinoTrasLogin(desde: string | undefined, rol: Usuario["rol"]): string {
    if (!desde || desde === "/" || desde.startsWith("/login") || desde.startsWith("/registro") || !puedeAcceder(desde, rol)) {
        return inicioPorRol[rol];
    }
    return desde;
}
