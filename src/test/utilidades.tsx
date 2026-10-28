// Funciones de ayuda para las pruebas (no son pruebas en sí).
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import CarritoProveedor from "../contexto/CarritoProveedor";
import SesionProveedor from "../contexto/SesionProveedor";
import { usuariosIniciales } from "../datos/usuarios";
import { almacenamiento, CLAVES } from "../servicios/almacenamiento";
import { pedidosServicio } from "../servicios/pedidosServicio";
import { productosServicio } from "../servicios/productosServicio";
import { sinClave, usuariosServicio } from "../servicios/usuariosServicio";
import type { ItemCarrito } from "../tipos/Pedido";
import type { Rol } from "../tipos/Usuario";

// Deja todo como al inicio: borra localStorage y vuelve a los datos originales del Excel
export function reiniciarDatos(): void {
    window.localStorage.clear();
    productosServicio.reiniciar();
    usuariosServicio.reiniciar();
    pedidosServicio.reiniciar();
}

// Simula que un usuario de prueba ya inició sesión (antes de renderizar)
export function iniciarSesionComo(rol: Rol): void {
    const usuario = usuariosIniciales.find((u) => u.rol === rol);
    if (usuario) {
        almacenamiento.guardar(CLAVES.sesion, sinClave(usuario));
    }
}

// Deja productos en el carrito guardado (antes de renderizar)
export function prepararCarrito(items: ItemCarrito[]): void {
    almacenamiento.guardar(CLAVES.carrito, items);
}

// Renderiza un componente con router + sesión + carrito (lo mínimo que necesitan las páginas)
export function renderizarConProveedores(ui: ReactElement, ruta = "/") {
    return render(
        <MemoryRouter initialEntries={[ruta]}>
            <SesionProveedor>
                <CarritoProveedor>{ui}</CarritoProveedor>
            </SesionProveedor>
        </MemoryRouter>
    );
}

// Renderiza la aplicación completa en una ruta (pruebas de navegación)
export function renderizarApp(ruta = "/") {
    return renderizarConProveedores(<App />, ruta);
}

// Escribe en el campo cuya etiqueta (label) coincide con el texto
export function escribir(etiqueta: string | RegExp, valor: string): void {
    fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}
