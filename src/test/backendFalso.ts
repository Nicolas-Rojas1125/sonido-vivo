// =====================================================================
// BACKEND FALSO PARA LAS PRUEBAS (mock de fetch)
// Simula los 3 microservicios Spring Boot con datos en memoria, para que las pruebas de
// Karma NO necesiten Laragon ni los microservicios encendidos.
// Reproduce las mismas reglas que el backend real:
//   - login/registro/refresh/logout con token y "cookie" de refresh
//   - catálogo (GET productos) y envío de contacto (POST) son PÚBLICOS, como en el backend real
//   - 401 sin token o con token inválido/expirado, 403 si el rol no tiene permiso
//   - pedidos con precio de la "base de datos" y stock "todo o nada" (409)
// =====================================================================
import { productosIniciales } from "../datos/productos";
import { pedidosIniciales } from "../datos/pedidos";
import { usuariosIniciales } from "../datos/usuarios";
import { URL_CONTACTOS, URL_TIENDA, URL_USUARIOS } from "../servicios/api";
import type { MensajeContacto } from "../tipos/Contacto";
import type { Pedido } from "../tipos/Pedido";
import type { Producto } from "../tipos/Producto";

type RolApi = "ADMINISTRADOR" | "VENDEDOR" | "CLIENTE";

interface UsuarioFalso {
    id: number;
    rut: string;
    nombre: string;
    correo: string;
    clave: string;
    rol: RolApi;
    activo: boolean;
}

interface PedidoFalso extends Pedido {
    usuarioId: number | null;
}

const COSTO_DESPACHO = 5990;

function json(cuerpo: unknown, estado = 200): Response {
    return new Response(estado === 204 ? null : JSON.stringify(cuerpo), {
        status: estado,
        headers: { "Content-Type": "application/json" },
    });
}

const error = (estado: number, mensaje: string) => json({ mensaje }, estado);

export class BackendFalso {
    productos: Producto[] = productosIniciales.map((p) => ({ ...p }));
    usuarios: UsuarioFalso[] = usuariosIniciales.map((u) => ({ ...u, rol: u.rol.toUpperCase() as RolApi }));
    pedidos: PedidoFalso[] = pedidosIniciales.map((p) => ({
        ...p,
        items: p.items.map((i) => ({ ...i })),
        usuarioId: p.clienteCorreo === "cliente@correo.cl" ? 3 : null,
    }));
    contactos: MensajeContacto[] = [];

    // "Cookie" httpOnly del refresh token: id del usuario con sesión en el navegador (o null)
    cookieRefresh: number | null = null;
    // Access tokens válidos -> id de usuario
    private tokens = new Map<string, number>();
    private contador = 0;
    // Simula que un microservicio está apagado (fetch falla con error de red)
    apagados = new Set<string>();

    // Deja al usuario del rol indicado con sesión guardada (como si hubiera recargado la página)
    conSesion(rol: "administrador" | "vendedor" | "cliente"): this {
        const usuario = this.usuarios.find((u) => u.rol === rol.toUpperCase());
        this.cookieRefresh = usuario ? usuario.id : null;
        return this;
    }

    // Simula que todos los access tokens expiraron (el siguiente request recibe 401 y el frontend debe renovar)
    expirarTokens(): void {
        this.tokens.clear();
    }

    apagar(base: string): void {
        this.apagados.add(base);
    }

    private emitir(usuario: UsuarioFalso, estado = 200): Response {
        this.contador += 1;
        const token = "jwt-" + usuario.id + "-" + this.contador;
        this.tokens.set(token, usuario.id);
        this.cookieRefresh = usuario.id;
        const { clave: _clave, ...publico } = usuario;
        void _clave;
        return json({ accessToken: token, tipo: "Bearer", expiraEnSegundos: 900, usuario: publico }, estado);
    }

    private usuarioDelToken(init?: RequestInit): UsuarioFalso | null {
        const headers = (init?.headers ?? {}) as Record<string, string>;
        const token = (headers["Authorization"] ?? "").replace("Bearer ", "");
        const id = this.tokens.get(token);
        return this.usuarios.find((u) => u.id === id) ?? null;
    }

    // Punto de entrada: reemplaza a window.fetch
    async responder(entrada: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const url = String(entrada);
        const metodo = (init?.method ?? "GET").toUpperCase();
        const cuerpo = init?.body ? JSON.parse(String(init.body)) : {};

        for (const base of this.apagados) {
            if (url.startsWith(base)) throw new TypeError("Failed to fetch");
        }

        // ---------------- ms-usuarios: autenticación (pública) ----------------
        if (url.startsWith(URL_USUARIOS + "/auth/")) {
            const accion = url.slice((URL_USUARIOS + "/auth/").length);
            if (accion === "login") {
                const usuario = this.usuarios.find((u) => u.correo === String(cuerpo.correo).toLowerCase());
                if (!usuario || usuario.clave !== cuerpo.clave) return error(401, "Correo o contraseña incorrectos.");
                if (!usuario.activo) return error(403, "Tu cuenta está desactivada. Contacta a la tienda.");
                return this.emitir(usuario);
            }
            if (accion === "registro") {
                if (this.usuarios.some((u) => u.correo === String(cuerpo.correo).toLowerCase())) {
                    return error(409, "Ya existe una cuenta con ese correo.");
                }
                const nuevo: UsuarioFalso = { ...cuerpo, correo: String(cuerpo.correo).toLowerCase(), id: this.siguienteId(this.usuarios), rol: "CLIENTE", activo: true };
                this.usuarios.push(nuevo);
                return this.emitir(nuevo, 201);
            }
            if (accion === "refresh") {
                const usuario = this.usuarios.find((u) => u.id === this.cookieRefresh);
                if (!usuario || !usuario.activo) return error(401, "No hay una sesión activa.");
                return this.emitir(usuario);
            }
            if (accion === "logout") {
                this.cookieRefresh = null;
                return json(null, 204);
            }
        }

        // ---------------- públicas (invitado): catálogo y envío de contacto ----------------
        // Igual que el backend real: con un token INVÁLIDO responde 401 aunque la ruta sea pública.
        const tieneHeader = Boolean((init?.headers as Record<string, string> | undefined)?.["Authorization"]);
        const usuario = this.usuarioDelToken(init);
        if (tieneHeader && !usuario) return json(null, 401);
        const esPublica =
            (metodo === "GET" && url.startsWith(URL_TIENDA + "/productos")) ||
            (metodo === "POST" && url === URL_CONTACTOS + "/contactos");
        if (!usuario && esPublica) {
            if (metodo === "GET") {
                const codigo = decodeURIComponent(url.slice((URL_TIENDA + "/productos").length).replace(/^\//, ""));
                if (!codigo) return json(this.productos);
                const producto = this.productos.find((p) => p.codigo === codigo);
                return producto ? json(producto) : error(404, "El producto " + codigo + " no existe.");
            }
            return this.guardarContacto(cuerpo);
        }

        // ---------------- todo lo demás exige token ----------------
        if (!usuario) return json(null, 401);
        const es = (...roles: RolApi[]) => roles.includes(usuario.rol);
        const prohibido = () => json(null, 403);

        // ---------------- ms-usuarios: gestión (ADMINISTRADOR) ----------------
        if (url.startsWith(URL_USUARIOS + "/usuarios")) {
            if (!es("ADMINISTRADOR")) return prohibido();
            const partes = url.slice((URL_USUARIOS + "/usuarios").length).split("/").filter(Boolean);
            const sinClave = (u: UsuarioFalso) => ({ id: u.id, rut: u.rut, nombre: u.nombre, correo: u.correo, rol: u.rol, activo: u.activo });
            if (metodo === "GET") return json(this.usuarios.map(sinClave));
            if (metodo === "POST") {
                if (this.usuarios.some((u) => u.correo === cuerpo.correo)) return error(409, "Ya existe una cuenta con ese correo.");
                const nuevo: UsuarioFalso = { ...cuerpo, id: this.siguienteId(this.usuarios), activo: true };
                this.usuarios.push(nuevo);
                return json(sinClave(nuevo), 201);
            }
            const objetivo = this.usuarios.find((u) => u.id === Number(partes[0]));
            if (!objetivo) return error(404, "El usuario no existe.");
            if (metodo === "PUT") {
                if (objetivo.id === usuario.id && objetivo.rol !== cuerpo.rol) {
                    return error(400, "No puedes cambiar tu propio rol (perderías el acceso al panel).");
                }
                Object.assign(objetivo, { rut: cuerpo.rut, nombre: cuerpo.nombre, correo: cuerpo.correo, rol: cuerpo.rol });
                if (cuerpo.clave) objetivo.clave = cuerpo.clave;
                return json(sinClave(objetivo));
            }
            if (metodo === "PATCH") {
                if (objetivo.id === usuario.id && !cuerpo.activo) return error(400, "No puedes desactivar tu propia cuenta.");
                objetivo.activo = cuerpo.activo;
                return json(sinClave(objetivo));
            }
        }
        if (url === URL_USUARIOS + "/auth/yo") return json(usuario);

        // ---------------- ms-tienda: productos ----------------
        if (url.startsWith(URL_TIENDA + "/productos")) {
            const partes = url.slice((URL_TIENDA + "/productos").length).split("/").filter(Boolean).map(decodeURIComponent);
            if (metodo === "GET") {
                if (partes.length === 0) return json(this.productos);
                const producto = this.productos.find((p) => p.codigo === partes[0]);
                return producto ? json(producto) : error(404, "El producto " + partes[0] + " no existe.");
            }
            if (metodo === "PATCH") {
                if (!es("ADMINISTRADOR", "VENDEDOR")) return prohibido();
                const producto = this.productos.find((p) => p.codigo === partes[0]);
                if (!producto) return error(404, "El producto no existe.");
                producto.stock = cuerpo.stock;
                return json(producto);
            }
            if (!es("ADMINISTRADOR")) return prohibido();
            if (metodo === "POST") {
                if (this.productos.some((p) => p.codigo === cuerpo.codigo)) {
                    return error(409, "Ya existe un producto con el código " + cuerpo.codigo + ".");
                }
                this.productos.push({ ...cuerpo });
                return json(cuerpo, 201);
            }
            const indice = this.productos.findIndex((p) => p.codigo === partes[0]);
            if (indice < 0) return error(404, "El producto " + partes[0] + " no existe.");
            if (metodo === "PUT") {
                this.productos[indice] = { ...cuerpo, codigo: partes[0] };
                return json(this.productos[indice]);
            }
            if (metodo === "DELETE") {
                this.productos.splice(indice, 1);
                return json(null, 204);
            }
        }

        // ---------------- ms-tienda: pedidos ----------------
        if (url.startsWith(URL_TIENDA + "/pedidos")) {
            const resto = url.slice((URL_TIENDA + "/pedidos").length);
            const publico = ({ usuarioId: _u, ...p }: PedidoFalso) => {
                void _u;
                return p;
            };
            const ordenados = () => [...this.pedidos].sort((a, b) => b.id - a.id);
            if (metodo === "POST" && resto === "") {
                if (!es("CLIENTE")) return prohibido();
                return this.crearPedido(usuario, cuerpo);
            }
            if (resto === "/mios") return es("CLIENTE") ? json(ordenados().filter((p) => p.usuarioId === usuario.id).map(publico)) : prohibido();
            if (!es("ADMINISTRADOR", "VENDEDOR")) return prohibido();
            if (resto === "") return json(ordenados().map(publico));
            if (resto === "/resumen") {
                const porEstado = { preparacion: 0, despachado: 0, entregado: 0 };
                this.pedidos.forEach((p) => (porEstado[p.estado] += 1));
                return json({ totalVentas: this.pedidos.reduce((t, p) => t + p.total, 0), cantidadPedidos: this.pedidos.length, porEstado });
            }
            const pedido = this.pedidos.find((p) => p.id === Number(resto.split("/")[1]));
            if (!pedido) return error(404, "El pedido no existe.");
            if (metodo === "PUT") {
                pedido.estado = cuerpo.estado;
                pedido.seguimiento = cuerpo.seguimiento ?? "";
                return json(publico(pedido));
            }
        }

        // ---------------- ms-contactos ----------------
        if (url.startsWith(URL_CONTACTOS + "/contactos")) {
            const partes = url.slice((URL_CONTACTOS + "/contactos").length).split("/").filter(Boolean);
            if (metodo === "POST" && partes.length === 0) return this.guardarContacto(cuerpo);
            if (!es("ADMINISTRADOR", "VENDEDOR")) return prohibido();
            if (metodo === "GET") return json(this.contactos);
            const contacto = this.contactos.find((c) => c.id === Number(partes[0]));
            if (!contacto) return json(null, 404);
            if (metodo === "PUT") {
                contacto.estado = "ATENDIDO";
                return json(contacto);
            }
            if (metodo === "DELETE") {
                this.contactos = this.contactos.filter((c) => c !== contacto);
                return json(null, 204);
            }
        }

        return json(null, 404);
    }

    private crearPedido(usuario: UsuarioFalso, datos: Record<string, unknown>): Response {
        const items = datos.items as { codigo: string; cantidad: number }[];
        // 1) Revisa TODO antes de descontar (todo o nada)
        for (const item of items) {
            const producto = this.productos.find((p) => p.codigo === item.codigo);
            if (!producto) return error(409, "El producto " + item.codigo + " ya no existe en el catálogo.");
            if (producto.stock < item.cantidad) {
                return error(409, "Stock insuficiente para " + producto.nombre + ". Disponible: " + producto.stock + ".");
            }
        }
        // 2) Descuenta y arma el detalle con el precio de la "base de datos"
        const detalle = items.map((item) => {
            const producto = this.productos.find((p) => p.codigo === item.codigo) as Producto;
            producto.stock -= item.cantidad;
            return { codigo: producto.codigo, nombre: producto.nombre, precio: producto.precio, cantidad: item.cantidad };
        });
        const subtotal = detalle.reduce((t, i) => t + i.precio * i.cantidad, 0);
        const costoEnvio = datos.tipoEntrega === "despacho" ? COSTO_DESPACHO : 0;
        const id = this.siguienteId(this.pedidos);
        const pedido: PedidoFalso = {
            id,
            numero: "SV-" + String(id).padStart(4, "0"),
            fecha: "2026-11-17T12:00:00",
            usuarioId: usuario.id,
            clienteCorreo: usuario.correo,
            clienteNombre: String(datos.clienteNombre),
            telefono: String(datos.telefono),
            items: detalle,
            tipoEntrega: datos.tipoEntrega as Pedido["tipoEntrega"],
            direccion: String(datos.direccion ?? ""),
            comuna: String(datos.comuna ?? ""),
            puntoRetiro: String(datos.puntoRetiro ?? ""),
            medioPago: datos.medioPago as Pedido["medioPago"],
            subtotal,
            costoEnvio,
            total: subtotal + costoEnvio,
            estado: "preparacion",
            seguimiento: "",
        };
        this.pedidos.push(pedido);
        const { usuarioId: _u, ...respuesta } = pedido;
        void _u;
        return json(respuesta, 201);
    }

    private guardarContacto(cuerpo: Record<string, unknown>): Response {
        const nuevo = {
            ...cuerpo,
            telefono: cuerpo.telefono || null,
            id: this.siguienteId(this.contactos),
            estado: "PENDIENTE",
            fechaCreacion: "2026-11-17T10:00:00",
        } as MensajeContacto;
        this.contactos.unshift(nuevo);
        return json(nuevo, 201);
    }

    private siguienteId(lista: { id: number }[]): number {
        return lista.reduce((max, x) => Math.max(max, x.id), 0) + 1;
    }
}

// Instala el backend falso: desde aquí, cada fetch de la app responde con estos datos.
// Se usa dentro de un it()/beforeEach (Jasmine quita el spy al terminar cada prueba).
export function instalarBackendFalso(): BackendFalso {
    const backend = new BackendFalso();
    spyOn(window, "fetch").and.callFake((entrada: RequestInfo | URL, init?: RequestInit) => backend.responder(entrada, init));
    return backend;
}
