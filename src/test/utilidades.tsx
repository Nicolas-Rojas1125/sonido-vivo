// Funciones de ayuda para las pruebas (no son pruebas en sí).
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import CarritoProveedor from "../contexto/CarritoProveedor";
import SesionProveedor from "../contexto/SesionProveedor";
import { almacenamiento, CLAVES } from "../servicios/almacenamiento";
import { tokenEnMemoria } from "../servicios/api";
import type { ItemCarrito } from "../tipos/Pedido";
import type { Rol } from "../tipos/Usuario";
import { instalarBackendFalso } from "./backendFalso";
import type { BackendFalso } from "./backendFalso";

// Backend falso de la prueba actual (simula los microservicios; ver backendFalso.ts)
let backendActual: BackendFalso | null = null;

export function backend(): BackendFalso {
    if (!backendActual) {
        throw new Error("Llama a reiniciarDatos() antes de usar el backend falso");
    }
    return backendActual;
}

// Deja todo como al inicio: borra localStorage y el token en memoria, e instala un backend
// falso NUEVO con los datos originales del Excel (cada prueba parte desde cero).
export function reiniciarDatos(): BackendFalso {
    window.localStorage.clear();
    tokenEnMemoria.limpiar();
    backendActual = instalarBackendFalso();
    return backendActual;
}

// Simula que un usuario de prueba ya inició sesión (tiene la cookie del refresh token):
// al renderizar, SesionProveedor recupera la sesión llamando a /auth/refresh.
export function iniciarSesionComo(rol: Rol): void {
    backend().conSesion(rol);
}

// Espera a que lleguen las respuestas del backend falso y React termine de actualizar la pantalla.
// act() asegura que todos los cambios de estado se apliquen antes de revisar el resultado.
export async function esperarBackend(): Promise<void> {
    for (let i = 0; i < 10; i++) {
        await act(async () => {
            await new Promise((resolver) => setTimeout(resolver, 0));
        });
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

// Renderiza la aplicación completa en una ruta y espera a que cargue (sesión + datos del backend)
export async function renderizarApp(ruta = "/") {
    const resultado = renderizarConProveedores(<App />, ruta);
    await esperarBackend();
    return resultado;
}

// Hace clic en el botón con ese nombre y espera la respuesta del backend
export async function clic(nombre: string | RegExp): Promise<void> {
    fireEvent.click(screen.getByRole("button", { name: nombre }));
    await esperarBackend();
}

// Igual que clic(), pero para un enlace (<Link>)
export async function clicEnlace(nombre: string | RegExp): Promise<void> {
    fireEvent.click(screen.getByRole("link", { name: nombre }));
    await esperarBackend();
}

// Escribe en el campo cuya etiqueta (label) coincide con el texto
export function escribir(etiqueta: string | RegExp, valor: string): void {
    fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

// Crea una respuesta HTTP falsa (como la que devolvería Spring Boot) para simular fetch en las pruebas.
// Ej: spyOn(window, "fetch").and.resolveTo(respuestaJson({ id: 1 }, 201))
export function respuestaJson(cuerpo: unknown, estado = 200): Response {
    const sinCuerpo = estado === 204;
    return new Response(sinCuerpo ? null : JSON.stringify(cuerpo), {
        status: estado,
        headers: { "Content-Type": "application/json" },
    });
}
