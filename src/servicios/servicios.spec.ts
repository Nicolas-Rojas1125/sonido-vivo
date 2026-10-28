import { reiniciarDatos } from "../test/utilidades";
import { almacenamiento, CLAVES } from "./almacenamiento";
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

describe("Servicio de productos", () => {
    beforeEach(() => reiniciarDatos());

    it("entrega los 51 productos del Excel y busca por código", () => {
        expect(productosServicio.obtenerTodos().length).toBe(51);
        expect(productosServicio.obtenerPorCodigo("MI001")?.modelo).toBe("SM58");
        expect(productosServicio.obtenerPorCodigo("XX999")).toBeUndefined();
    });

    it("devuelve copias: modificar el resultado no cambia los datos", () => {
        const producto = productosServicio.obtenerPorCodigo("GA001");
        if (producto) producto.precio = 1;
        expect(productosServicio.obtenerPorCodigo("GA001")?.precio).toBe(129990);
    });

    it("crea un producto y rechaza códigos repetidos", () => {
        const base = productosServicio.obtenerPorCodigo("GA001")!;
        expect(productosServicio.crear({ ...base, codigo: "GA099" }).ok).toBeTrue();
        const repetido = productosServicio.crear({ ...base, codigo: "GA099" });
        expect(repetido.ok).toBeFalse();
        expect(repetido.mensaje).toContain("Ya existe");
    });

    it("guarda los cambios en el almacenamiento (spy sobre almacenamiento.guardar)", () => {
        const guardar = spyOn(almacenamiento, "guardar").and.callThrough();
        productosServicio.actualizarStock("GA001", 20);
        expect(guardar).toHaveBeenCalledWith(CLAVES.productos, jasmine.any(Array));
    });

    it("actualiza, cambia stock y elimina productos", () => {
        const base = productosServicio.obtenerPorCodigo("PE001")!;
        expect(productosServicio.actualizar("PE001", { ...base, precio: 75000 }).ok).toBeTrue();
        expect(productosServicio.obtenerPorCodigo("PE001")?.precio).toBe(75000);
        expect(productosServicio.actualizarStock("PE001", -3).ok).toBeFalse();
        expect(productosServicio.actualizarStock("PE001", 0).ok).toBeTrue();
        expect(productosServicio.eliminar("PE001").ok).toBeTrue();
        expect(productosServicio.eliminar("PE001").ok).toBeFalse();
    });

    it("descuenta stock solo si TODOS los productos alcanzan", () => {
        // GE005 tiene stock 2: pedir 3 debe fallar y no tocar el stock de GA001
        const fallo = productosServicio.descontarStock([
            { codigo: "GA001", cantidad: 1 },
            { codigo: "GE005", cantidad: 3 },
        ]);
        expect(fallo.ok).toBeFalse();
        expect(productosServicio.obtenerPorCodigo("GA001")?.stock).toBe(8);

        const exito = productosServicio.descontarStock([{ codigo: "GE005", cantidad: 2 }]);
        expect(exito.ok).toBeTrue();
        expect(productosServicio.obtenerPorCodigo("GE005")?.stock).toBe(0);
    });
});

describe("Servicio de usuarios", () => {
    beforeEach(() => reiniciarDatos());

    it("autentica con credenciales correctas y nunca devuelve la contraseña", () => {
        const resultado = usuariosServicio.autenticar("ADMIN@sonidovivo.cl", "Admin123");
        expect(resultado.ok).toBeTrue();
        expect(resultado.usuario?.rol).toBe("administrador");
        expect(Object.keys(resultado.usuario ?? {})).not.toContain("clave");
    });

    it("rechaza contraseña incorrecta y cuentas desactivadas", () => {
        expect(usuariosServicio.autenticar("admin@sonidovivo.cl", "otra").ok).toBeFalse();
        usuariosServicio.cambiarEstado(2, false);
        const resultado = usuariosServicio.autenticar("vendedor@sonidovivo.cl", "Vende123");
        expect(resultado.ok).toBeFalse();
        expect(resultado.mensaje).toContain("desactivada");
    });

    it("crea usuarios y no permite correo o RUT repetidos", () => {
        const datos = { rut: "16.543.210-K", nombre: "Ana Díaz", correo: "ana@correo.cl", clave: "Clave1234", rol: "vendedor" as const };
        expect(usuariosServicio.crear(datos).ok).toBeTrue();
        expect(usuariosServicio.crear({ ...datos, rut: "5.126.663-3" }).mensaje).toContain("correo");
        expect(usuariosServicio.crear({ ...datos, correo: "otra@correo.cl" }).mensaje).toContain("RUT");
    });

    it("al editar sin contraseña mantiene la contraseña anterior", () => {
        usuariosServicio.actualizar(3, { rut: "9.876.543-3", nombre: "Cliente Editado", correo: "cliente@correo.cl", clave: "", rol: "cliente" });
        expect(usuariosServicio.obtenerPorId(3)?.nombre).toBe("Cliente Editado");
        expect(usuariosServicio.autenticar("cliente@correo.cl", "Cliente123").ok).toBeTrue();
    });
});

describe("Servicio de pedidos", () => {
    beforeEach(() => reiniciarDatos());

    const nuevo: DatosNuevoPedido = {
        clienteCorreo: "Nuevo@Correo.cl",
        clienteNombre: "Nuevo Cliente",
        telefono: "+56 9 5555 5555",
        items: [
            { codigo: "AC004", nombre: "Púas", precio: 3990, cantidad: 2 },
            { codigo: "AC006", nombre: "Afinador", precio: 8990, cantidad: 1 },
        ],
        tipoEntrega: "despacho",
        direccion: "Calle 1",
        comuna: "Talca",
        puntoRetiro: "",
        medioPago: "webpay",
        costoEnvio: 5990,
    };

    it("crea el pedido con número, total, fecha y estado inicial", () => {
        // MOCK del reloj: la fecha del pedido queda fija para poder comprobarla
        jasmine.clock().install();
        jasmine.clock().mockDate(new Date("2026-10-27T12:00:00Z"));

        const pedido = pedidosServicio.crear(nuevo);

        jasmine.clock().uninstall();
        expect(pedido.numero).toBe("SV-0004");
        expect(pedido.subtotal).toBe(16970);
        expect(pedido.total).toBe(22960);
        expect(pedido.estado).toBe("preparacion");
        expect(pedido.fecha).toBe("2026-10-27T12:00:00.000Z");
    });

    it("cada cliente ve solo sus pedidos", () => {
        pedidosServicio.crear(nuevo);
        expect(pedidosServicio.obtenerPorCliente("nuevo@correo.cl").length).toBe(1);
        expect(pedidosServicio.obtenerPorCliente("cliente@correo.cl").every((p) => p.clienteCorreo === "cliente@correo.cl")).toBeTrue();
    });

    it("actualiza el estado y el número de seguimiento", () => {
        const actualizado = pedidosServicio.actualizarEstado(3, "despachado", "  CHX-123 ");
        expect(actualizado?.estado).toBe("despachado");
        expect(actualizado?.seguimiento).toBe("CHX-123");
        expect(pedidosServicio.actualizarEstado(999, "entregado")).toBeUndefined();
    });

    it("calcula el resumen de ventas por estado", () => {
        const resumen = pedidosServicio.obtenerResumen();
        expect(resumen.cantidadPedidos).toBe(3);
        expect(resumen.totalVentas).toBe(32960 + 79990 + 155980);
        expect(resumen.porEstado).toEqual({ preparacion: 1, despachado: 1, entregado: 1 });
    });
});
