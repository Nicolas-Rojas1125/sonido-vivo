import { productosIniciales } from "../datos/productos";
import { backend, reiniciarDatos } from "../test/utilidades";
import { almacenamiento } from "./almacenamiento";
import { api, ErrorApi, mensajeDeError, tokenEnMemoria, URL_CONTACTOS, URL_TIENDA } from "./api";
import { authServicio } from "./authServicio";
import { pedidosServicio } from "./pedidosServicio";
import type { DatosNuevoPedido } from "./pedidosServicio";
import { productosServicio } from "./productosServicio";
import { usuariosServicio } from "./usuariosServicio";

describe("Servicio de almacenamiento (localStorage)", () => {
    it("guarda y lee valores como JSON", () => {
        almacenamiento.guardar("prueba", { a: 1 });
        expect(almacenamiento.leer<{ a: number } | null>("prueba", null)).toEqual({ a: 1 });
        almacenamiento.eliminar("prueba");
        expect(almacenamiento.leer("prueba", "vacío")).toBe("vacío");
    });

    it("devuelve el valor por defecto si localStorage falla (mock que lanza error)", () => {
        // MOCK: se reemplaza getItem por una función que lanza un error
        spyOn(Storage.prototype, "getItem").and.throwError("bloqueado");
        expect(almacenamiento.leer("cualquiera", 42)).toBe(42);
    });

    it("no rompe la app si no se puede guardar", () => {
        const setItem = spyOn(Storage.prototype, "setItem").and.throwError("lleno");
        expect(() => almacenamiento.guardar("x", 1)).not.toThrow();
        expect(setItem).toHaveBeenCalled();
    });
});

// Inicia sesión contra el backend falso (deja el token en memoria)
async function entrarComo(correo: string, clave: string): Promise<void> {
    const resultado = await authServicio.iniciarSesion(correo, clave);
    expect(resultado.ok).toBeTrue();
}

describe("Cliente HTTP (api.ts)", () => {
    beforeEach(() => reiniciarDatos());

    it("agrega el header Authorization: Bearer con el token en memoria", async () => {
        await entrarComo("cliente@correo.cl", "Cliente123");
        await productosServicio.listar();
        const [, opciones] = (window.fetch as jasmine.Spy).calls.mostRecent().args as [string, RequestInit];
        expect((opciones.headers as Record<string, string>)["Authorization"]).toBe("Bearer " + tokenEnMemoria.obtener());
    });

    it("sin token (invitado) el catálogo es público, pero un recurso privado responde 401 con mensaje claro", async () => {
        const catalogo = await api.get<unknown[]>(URL_TIENDA + "/productos");
        expect(catalogo.length).toBe(productosIniciales.length);
        expect(tokenEnMemoria.obtener()).toBeNull();
        try {
            await api.get(URL_TIENDA + "/pedidos/mios");
            fail("debía fallar");
        } catch (error) {
            expect(error instanceof ErrorApi && error.estado === 401).toBeTrue();
            expect(mensajeDeError(error)).toBe("Tu sesión expiró. Inicia sesión nuevamente.");
        }
    });

    it("un invitado puede enviar un mensaje de contacto (POST público)", async () => {
        const guardado = await api.post<{ estado: string }>(URL_CONTACTOS + "/contactos", {
            nombreCompleto: "Invitado Prueba",
            correo: "invitado@correo.cl",
            telefono: "",
            asunto: "stock",
            mensaje: "¿Tienen stock?",
        });
        expect(guardado.estado).toBe("PENDIENTE");
    });

    it("si el servidor está apagado lanza un error de conexión (estado 0)", async () => {
        backend().apagar(URL_TIENDA);
        try {
            await api.get(URL_TIENDA + "/productos");
            fail("debía fallar");
        } catch (error) {
            expect(error instanceof ErrorApi && error.estado === 0).toBeTrue();
            expect(mensajeDeError(error)).toContain("No se pudo conectar con el servidor");
        }
    });

    it("usa el mensaje del backend ({ mensaje }) en los errores de negocio", async () => {
        await entrarComo("admin@sonidovivo.cl", "Admin123");
        const resultado = await productosServicio.crear({ ...productosIniciales[0] }); // GA001 ya existe -> 409
        expect(resultado).toEqual({ ok: false, mensaje: "Ya existe un producto con el código GA001." });
    });

    it("mensajeDeError devuelve un texto por defecto para errores desconocidos", () => {
        expect(mensajeDeError(new Error("x"), "Por defecto")).toBe("Por defecto");
    });
});

describe("Servicio de autenticación (JWT)", () => {
    beforeEach(() => reiniciarDatos());

    it("login correcto guarda el token y convierte el rol a minúscula", async () => {
        const resultado = await authServicio.iniciarSesion("admin@sonidovivo.cl", "Admin123");
        expect(resultado.usuario?.rol).toBe("administrador");
        expect(tokenEnMemoria.obtener()).not.toBeNull();
    });

    it("login incorrecto y cuenta desactivada devuelven el mensaje del backend", async () => {
        expect((await authServicio.iniciarSesion("admin@sonidovivo.cl", "mala")).mensaje).toBe("Correo o contraseña incorrectos.");
        backend().usuarios.find((u) => u.id === 2)!.activo = false;
        expect((await authServicio.iniciarSesion("vendedor@sonidovivo.cl", "Vende123")).mensaje).toContain("desactivada");
    });

    it("renovar usa la cookie del refresh token y comparte UNA sola petición si se llama dos veces a la vez", async () => {
        backend().conSesion("cliente");
        const [a, b] = await Promise.all([authServicio.renovar(), authServicio.renovar()]);
        expect(a?.correo).toBe("cliente@correo.cl");
        expect(b).toBe(a);
        const refrescos = (window.fetch as jasmine.Spy).calls.allArgs().filter(([url]) => String(url).endsWith("/auth/refresh"));
        expect(refrescos.length).toBe(1); // el refresh token rota: usarlo dos veces cerraría la sesión
    });

    it("renovar sin cookie devuelve null y limpia el token", async () => {
        tokenEnMemoria.guardar("viejo");
        expect(await authServicio.renovar()).toBeNull();
        expect(tokenEnMemoria.obtener()).toBeNull();
    });

    it("cerrar sesión borra el token aunque el servidor no responda", async () => {
        await entrarComo("cliente@correo.cl", "Cliente123");
        backend().apagar("http://localhost:8081");
        await authServicio.cerrarSesion();
        expect(tokenEnMemoria.obtener()).toBeNull();
    });
});

describe("Servicio de productos (ms-tienda)", () => {
    beforeEach(async () => {
        reiniciarDatos();
        await entrarComo("admin@sonidovivo.cl", "Admin123");
    });

    it("lista el catálogo y obtiene un producto por código (null si no existe)", async () => {
        expect((await productosServicio.listar()).length).toBe(51);
        expect((await productosServicio.obtener("GA001"))?.nombre).toBe("Guitarra Acústica Folk");
        expect(await productosServicio.obtener("NO999")).toBeNull();
    });

    it("crea, actualiza y elimina productos", async () => {
        const nuevo = { ...productosIniciales[0], codigo: "GA099", nombre: "Nueva" };
        expect((await productosServicio.crear(nuevo)).ok).toBeTrue();
        expect((await productosServicio.actualizar("GA099", { ...nuevo, precio: 1000 })).ok).toBeTrue();
        expect(backend().productos.find((p) => p.codigo === "GA099")?.precio).toBe(1000);
        expect((await productosServicio.eliminar("GA099")).mensaje).toBe("Producto GA099 eliminado.");
        expect((await productosServicio.eliminar("GA099")).ok).toBeFalse(); // 404
    });

    it("actualiza el stock y valida que sea un entero >= 0 antes de llamar al backend", async () => {
        expect(await productosServicio.actualizarStock("GA001", 3)).toEqual({ ok: true, mensaje: "Stock de GA001 actualizado a 3." });
        expect((await productosServicio.actualizarStock("GA001", -1)).ok).toBeFalse();
        expect((await productosServicio.actualizarStock("GA001", 1.5)).ok).toBeFalse();
        expect(backend().productos.find((p) => p.codigo === "GA001")?.stock).toBe(3);
    });
});

describe("Servicio de pedidos (ms-tienda)", () => {
    const datos: DatosNuevoPedido = {
        clienteNombre: "Cliente de Prueba",
        telefono: "+56 9 1111 2222",
        items: [{ codigo: "GA001", cantidad: 2 }],
        tipoEntrega: "despacho",
        direccion: "Calle 1",
        comuna: "Providencia",
        puntoRetiro: "",
        medioPago: "webpay",
    };

    beforeEach(() => reiniciarDatos());

    it("el cliente crea un pedido: el servidor pone precio, envío y total, y descuenta stock", async () => {
        await entrarComo("cliente@correo.cl", "Cliente123");
        const pedido = await pedidosServicio.crear(datos);
        expect(pedido.numero).toBe("SV-0004");
        expect(pedido.total).toBe(2 * 129990 + 5990);
        expect(pedido.clienteCorreo).toBe("cliente@correo.cl");
        expect(backend().productos.find((p) => p.codigo === "GA001")?.stock).toBe(6);
        expect((await pedidosServicio.misPedidos()).length).toBe(3);
    });

    it("si un producto no tiene stock suficiente, falla con 409 y no descuenta nada", async () => {
        await entrarComo("cliente@correo.cl", "Cliente123");
        const sinStock = { ...datos, items: [{ codigo: "GA001", cantidad: 1 }, { codigo: "GE005", cantidad: 9 }] };
        await expectAsync(pedidosServicio.crear(sinStock)).toBeRejectedWith(jasmine.objectContaining({ estado: 409 }));
        expect(backend().productos.find((p) => p.codigo === "GA001")?.stock).toBe(8);
    });

    it("el vendedor lista todos, actualiza el estado y ve el resumen; el cliente no puede", async () => {
        await entrarComo("vendedor@sonidovivo.cl", "Vende123");
        expect((await pedidosServicio.listarTodos()).length).toBe(3);
        const actualizado = await pedidosServicio.actualizarEstado(3, "despachado", "  CHX-1  ");
        expect(actualizado.seguimiento).toBe("CHX-1");
        expect((await pedidosServicio.obtenerResumen()).totalVentas).toBe(268930);

        await entrarComo("cliente@correo.cl", "Cliente123");
        await expectAsync(pedidosServicio.listarTodos()).toBeRejectedWith(jasmine.objectContaining({ estado: 403 }));
    });
});

describe("Servicio de usuarios (ms-usuarios, solo administrador)", () => {
    const nuevo = { rut: "20.111.333-4", nombre: "Nuevo", correo: "nuevo@sonidovivo.cl", clave: "Clave1234", rol: "vendedor" as const };

    beforeEach(async () => {
        reiniciarDatos();
        await entrarComo("admin@sonidovivo.cl", "Admin123");
    });

    it("lista, crea (rol en MAYÚSCULAS hacia la API) y detecta correos duplicados", async () => {
        expect((await usuariosServicio.listar()).map((u) => u.rol)).toEqual(["administrador", "vendedor", "cliente"]);
        const creado = await usuariosServicio.crear(nuevo);
        expect(creado.ok).toBeTrue();
        expect(backend().usuarios.find((u) => u.correo === "nuevo@sonidovivo.cl")?.rol).toBe("VENDEDOR");
        expect((await usuariosServicio.crear(nuevo)).mensaje).toBe("Ya existe una cuenta con ese correo.");
    });

    it("actualiza y cambia el estado; el backend impide desactivar la propia cuenta", async () => {
        expect((await usuariosServicio.actualizar(3, { ...nuevo, correo: "cliente@correo.cl", rol: "cliente", clave: "" })).ok).toBeTrue();
        expect((await usuariosServicio.cambiarEstado(3, false)).mensaje).toBe("Usuario Nuevo desactivado.");
        expect((await usuariosServicio.cambiarEstado(1, false)).mensaje).toBe("No puedes desactivar tu propia cuenta.");
    });

    it("un vendedor no puede gestionar usuarios (403)", async () => {
        await entrarComo("vendedor@sonidovivo.cl", "Vende123");
        await expectAsync(usuariosServicio.listar()).toBeRejectedWith(jasmine.objectContaining({ estado: 403 }));
    });
});
