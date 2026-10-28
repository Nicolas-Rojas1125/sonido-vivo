import { act, render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { productosIniciales } from "../datos/productos";
import { almacenamiento, CLAVES } from "../servicios/almacenamiento";
import { usuariosServicio } from "../servicios/usuariosServicio";
import { reiniciarDatos } from "../test/utilidades";
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

    it("al cargar sincroniza el carrito guardado con el catálogo (precio actual, sin productos eliminados)", () => {
        almacenamiento.guardar(CLAVES.carrito, [
            { codigo: "GA001", nombre: "Viejo", marca: "Yamaha", precio: 1, imagen: "", cantidad: 99, stock: 99 },
            { codigo: "ZZ999", nombre: "Eliminado", marca: "X", precio: 1000, imagen: "", cantidad: 1, stock: 5 },
        ]);
        const { result } = renderHook(() => useCarrito(), { wrapper: proveedores });
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

describe("Contexto de sesión (estado global)", () => {
    beforeEach(() => reiniciarDatos());

    it("inicia sesión con un usuario válido y guarda la sesión", () => {
        const { result } = renderHook(() => useSesion(), { wrapper: proveedores });
        let resultado = { ok: false };
        act(() => {
            resultado = result.current.iniciarSesion("vendedor@sonidovivo.cl", "Vende123");
        });
        expect(resultado.ok).toBeTrue();
        expect(result.current.usuario?.rol).toBe("vendedor");
        expect(result.current.tieneRol("vendedor", "administrador")).toBeTrue();
        expect(result.current.tieneRol("cliente")).toBeFalse();
        expect(almacenamiento.leer(CLAVES.sesion, null)).not.toBeNull();
    });

    it("usa el servicio de usuarios para autenticar (mock con spyOn + returnValue)", () => {
        // MOCK: el servicio responde lo que queremos, sin revisar usuarios reales
        const autenticar = spyOn(usuariosServicio, "autenticar").and.returnValue({ ok: false, mensaje: "Correo o contraseña incorrectos." });
        const { result } = renderHook(() => useSesion(), { wrapper: proveedores });
        act(() => {
            result.current.iniciarSesion("x@x.cl", "123");
        });
        expect(autenticar).toHaveBeenCalledWith("x@x.cl", "123");
        expect(result.current.usuario).toBeNull();
    });

    it("el registro público crea siempre un usuario Cliente y cerrar sesión lo desconecta", () => {
        const { result } = renderHook(() => useSesion(), { wrapper: proveedores });
        act(() => {
            result.current.registrar({ rut: "15.111.222-6", nombre: "Nueva Clienta", correo: "nueva@correo.cl", clave: "Clave1234" });
        });
        expect(result.current.usuario?.rol).toBe("cliente");
        act(() => result.current.cerrarSesion());
        expect(result.current.usuario).toBeNull();
    });

    it("muestra el nombre del usuario conectado en un componente consumidor", () => {
        almacenamiento.guardar(CLAVES.sesion, { id: 3, rut: "", nombre: "Cliente de Prueba", correo: "cliente@correo.cl", rol: "cliente", activo: true });
        const Saludo = () => <p>{useSesion().usuario?.nombre}</p>;
        render(<Saludo />, { wrapper: proveedores });
        expect(screen.getByText("Cliente de Prueba")).toBeTruthy();
    });

    it("valida la sesión guardada: si alguien cambia su rol en localStorage, se usa el rol real", () => {
        // Simula a un cliente que edita localStorage para hacerse pasar por administrador
        almacenamiento.guardar(CLAVES.sesion, { id: 3, rut: "", nombre: "Hacker", correo: "cliente@correo.cl", rol: "administrador", activo: true });
        const { result } = renderHook(() => useSesion(), { wrapper: proveedores });
        expect(result.current.usuario?.rol).toBe("cliente");
        expect(result.current.tieneRol("administrador")).toBeFalse();
    });

    it("si la cuenta fue desactivada, la sesión guardada deja de valer", () => {
        almacenamiento.guardar(CLAVES.sesion, { id: 2, rut: "", nombre: "Vendedor", correo: "vendedor@sonidovivo.cl", rol: "vendedor", activo: true });
        usuariosServicio.cambiarEstado(2, false);
        const { result } = renderHook(() => useSesion(), { wrapper: proveedores });
        expect(result.current.usuario).toBeNull();
    });
});
