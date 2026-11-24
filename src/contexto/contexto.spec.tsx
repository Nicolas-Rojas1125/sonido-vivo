import { act, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { productosIniciales } from "../datos/productos";
import { almacenamiento, CLAVES } from "../servicios/almacenamiento";
import { tokenEnMemoria } from "../servicios/api";
import { authServicio } from "../servicios/authServicio";
import { pedidosServicio } from "../servicios/pedidosServicio";
import type { ResultadoSesion } from "../servicios/authServicio";
import { productosServicio } from "../servicios/productosServicio";
import { backend, esperarBackend, iniciarSesionComo, reiniciarDatos } from "../test/utilidades";
import CarritoProveedor from "./CarritoProveedor";
import SesionProveedor from "./SesionProveedor";
import { useCarrito } from "./useCarrito";
import { useSesion } from "./useSesion";

const proveedores = ({ children }: { children: ReactNode }) => (
    <SesionProveedor>
        <CarritoProveedor>{children}</CarritoProveedor>
    </SesionProveedor>
);

describe("Contexto del carrito (estado global)", () => {
    beforeEach(() => reiniciarDatos());

    it("agrega productos y recalcula unidades y subtotal", () => {
        const { result } = renderHook(() => useCarrito(), { wrapper: proveedores });
        act(() => result.current.agregar(productosIniciales[0], 2)); // 2 × 129.990
        act(() => result.current.agregar(productosIniciales[1])); // 1 × 189.990
        expect(result.current.unidades).toBe(3);
        expect(result.current.subtotal).toBe(449970);
    });

    it("al iniciar la sesión sincroniza el carrito guardado con el catálogo del backend (precio actual, sin eliminados)", async () => {
        iniciarSesionComo("cliente");
        almacenamiento.guardar(CLAVES.carrito, [
            { codigo: "GA001", nombre: "Viejo", marca: "Yamaha", precio: 1, imagen: "", cantidad: 99, stock: 99 },
            { codigo: "ZZ999", nombre: "Eliminado", marca: "X", precio: 1000, imagen: "", cantidad: 1, stock: 5 },
        ]);
        const { result } = renderHook(() => useCarrito(), { wrapper: proveedores });
        await esperarBackend(); // GET /api/productos
        expect(result.current.items.length).toBe(1);
        expect(result.current.items[0].precio).toBe(129990);
        expect(result.current.items[0].cantidad).toBe(8); // limitado al stock real
    });

    it("cambia cantidad, quita y vacía el carrito", () => {
        const { result } = renderHook(() => useCarrito(), { wrapper: proveedores });
        act(() => result.current.agregar(productosIniciales[0]));
        act(() => result.current.agregar(productosIniciales[1]));
        act(() => result.current.cambiarCantidad("GA001", 4));
        expect(result.current.items[0].cantidad).toBe(4);
        act(() => result.current.quitar("GA001"));
        expect(result.current.items.map((i) => i.codigo)).toEqual(["GA002"]);
        act(() => result.current.vaciar());
        expect(result.current.items).toEqual([]);
    });

    it("guarda el carrito en el navegador cada vez que cambia (spy)", () => {
        const guardar = spyOn(almacenamiento, "guardar").and.callThrough();
        const { result } = renderHook(() => useCarrito(), { wrapper: proveedores });
        act(() => result.current.agregar(productosIniciales[0]));
        expect(guardar).toHaveBeenCalledWith(CLAVES.carrito, [jasmine.objectContaining({ codigo: "GA001", cantidad: 1 })]);
    });

    it("lanza un error claro si se usa fuera del proveedor", () => {
        spyOn(console, "error"); // evita que React ensucie la consola con el error esperado
        const SinProveedor = () => {
            useCarrito();
            return null;
        };
        expect(() => render(<SinProveedor />)).toThrowError("useCarrito debe usarse dentro de <CarritoProveedor>");
    });
});

describe("Contexto de sesión con JWT (estado global)", () => {
    beforeEach(() => reiniciarDatos());

    it("inicia sesión: el token queda SOLO en memoria (no en localStorage) y el rol viene del backend", async () => {
        const { result } = renderHook(() => useSesion(), { wrapper: proveedores });
        await esperarBackend();
        let resultado: ResultadoSesion = { ok: false, mensaje: "" };
        await act(async () => {
            resultado = await result.current.iniciarSesion("vendedor@sonidovivo.cl", "Vende123");
        });
        expect(resultado.ok).toBeTrue();
        expect(result.current.usuario?.rol).toBe("vendedor");
        expect(result.current.tieneRol("vendedor", "administrador")).toBeTrue();
        expect(result.current.tieneRol("cliente")).toBeFalse();
        expect(tokenEnMemoria.obtener()).toMatch(/^jwt-/);
        expect(JSON.stringify({ ...window.localStorage })).not.toContain("jwt-"); // seguridad ante XSS
    });

    it("usa el servicio de autenticación (mock con spyOn + resolveTo)", async () => {
        // MOCK: el servicio responde lo que queremos, sin llamar al backend
        const iniciar = spyOn(authServicio, "iniciarSesion").and.resolveTo({ ok: false, mensaje: "Correo o contraseña incorrectos." });
        const { result } = renderHook(() => useSesion(), { wrapper: proveedores });
        await esperarBackend();
        await act(async () => {
            await result.current.iniciarSesion("x@x.cl", "123");
        });
        expect(iniciar).toHaveBeenCalledWith("x@x.cl", "123");
        expect(result.current.usuario).toBeNull();
    });

    it("el registro público crea siempre un Cliente y cerrar sesión revoca la sesión en el servidor", async () => {
        const { result } = renderHook(() => useSesion(), { wrapper: proveedores });
        await esperarBackend();
        await act(async () => {
            await result.current.registrar({ rut: "15.111.222-6", nombre: "Nueva Clienta", correo: "nueva@correo.cl", clave: "Clave1234" });
        });
        expect(result.current.usuario?.rol).toBe("cliente");
        await act(async () => {
            await result.current.cerrarSesion();
        });
        expect(result.current.usuario).toBeNull();
        expect(tokenEnMemoria.obtener()).toBeNull();
        expect(backend().cookieRefresh).toBeNull(); // el backend borró la cookie del refresh token
    });

    it("al RECARGAR la página recupera la sesión con el refresh token (persistencia)", async () => {
        iniciarSesionComo("cliente"); // existe la cookie httpOnly de una visita anterior
        const Saludo = () => {
            const { usuario, cargando } = useSesion();
            return <p>{cargando ? "Verificando..." : usuario?.nombre}</p>;
        };
        render(<Saludo />, { wrapper: proveedores });
        expect(screen.getByText("Verificando...")).toBeTruthy(); // mientras responde /auth/refresh
        await esperarBackend();
        expect(screen.getByText("Cliente de Prueba")).toBeTruthy();
        expect(tokenEnMemoria.obtener()).not.toBeNull();
    });

    it("editar localStorage no da permisos: el rol siempre viene del servidor", async () => {
        // Simula a un cliente que intenta hacerse pasar por administrador desde el navegador
        window.localStorage.setItem("sv_sesion", JSON.stringify({ id: 3, nombre: "Hacker", rol: "administrador" }));
        iniciarSesionComo("cliente");
        const { result } = renderHook(() => useSesion(), { wrapper: proveedores });
        await esperarBackend();
        expect(result.current.usuario?.rol).toBe("cliente");
        expect(result.current.tieneRol("administrador")).toBeFalse();
    });

    it("si la cuenta fue desactivada, el backend rechaza la renovación y no hay sesión", async () => {
        iniciarSesionComo("vendedor");
        backend().usuarios.find((u) => u.id === 2)!.activo = false;
        const { result } = renderHook(() => useSesion(), { wrapper: proveedores });
        await esperarBackend();
        expect(result.current.usuario).toBeNull();
    });

    it("si el access token expiró, lo renueva automáticamente y repite la petición", async () => {
        iniciarSesionComo("cliente");
        renderHook(() => useSesion(), { wrapper: proveedores });
        await esperarBackend();
        const tokenAnterior = tokenEnMemoria.obtener();

        backend().expirarTokens(); // el servidor ya no acepta el token actual -> responderá 401
        const productos = await productosServicio.listar();

        expect(productos.length).toBe(51); // la petición se repitió con el token nuevo
        expect(tokenEnMemoria.obtener()).not.toBe(tokenAnterior);
    });

    it("si ya no se puede renovar, cierra la sesión, avisa que expiró y sigue como invitado", async () => {
        iniciarSesionComo("cliente");
        const { result } = renderHook(() => useSesion(), { wrapper: proveedores });
        await esperarBackend();
        expect(result.current.usuario).not.toBeNull();

        backend().expirarTokens();
        backend().cookieRefresh = null; // el refresh token también venció
        // Un recurso privado (mis pedidos) falla con 401...
        await act(async () => {
            await expectAsync(pedidosServicio.misPedidos()).toBeRejectedWith(jasmine.objectContaining({ estado: 401 }));
        });
        expect(result.current.usuario).toBeNull();
        expect(result.current.aviso).toBe("Tu sesión expiró. Inicia sesión nuevamente.");
        expect(tokenEnMemoria.obtener()).toBeNull();

        // ...pero el catálogo (público) sigue cargando como invitado
        const catalogo = await productosServicio.listar();
        expect(catalogo.length).toBe(productosIniciales.length);
    });

    it("si el token expiró en una ruta pública, se reintenta como invitado en vez de fallar", async () => {
        iniciarSesionComo("cliente");
        const { result } = renderHook(() => useSesion(), { wrapper: proveedores });
        await esperarBackend();
        backend().expirarTokens();
        backend().cookieRefresh = null;
        let catalogo: unknown[] = [];
        await act(async () => {
            catalogo = await productosServicio.listar();
        });
        expect(catalogo.length).toBe(productosIniciales.length);
        expect(result.current.usuario).toBeNull();
    });

    it("lanza un error claro si se usa fuera del proveedor", () => {
        spyOn(console, "error");
        const SinProveedor = () => {
            useSesion();
            return null;
        };
        expect(() => render(<SinProveedor />)).toThrowError(/useSesion debe usarse dentro de/);
    });
});
