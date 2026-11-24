import { fireEvent, screen, within } from "@testing-library/react";
import { URL_CONTACTOS } from "../../servicios/api";
import { URL_API_CONTACTOS } from "../../servicios/contactosServicio";
import { backend, esperarBackend, iniciarSesionComo, reiniciarDatos, renderizarApp } from "../../test/utilidades";
import type { MensajeContacto } from "../../tipos/Contacto";

// Prueba la vista Panel → Contactos con el backend falso (src/test/backendFalso.ts).

const pendiente: MensajeContacto = {
    id: 1,
    nombreCompleto: "Tomás Vera",
    correo: "tomas@correo.cl",
    telefono: "+56 9 1234 5678",
    asunto: "stock",
    mensaje: "¿Tienen stock del pedal Boss DS-1?",
    estado: "PENDIENTE",
    fechaCreacion: "2026-11-17T10:30:00",
};
const atendido: MensajeContacto = {
    id: 2,
    nombreCompleto: "Camila Soto",
    correo: "camila@correo.cl",
    telefono: null,
    asunto: "reparacion",
    mensaje: "Necesito calibrar mi guitarra.",
    estado: "ATENDIDO",
    fechaCreacion: "2026-11-16T09:00:00",
};

// Hace que el backend falso responda con un error a un método HTTP y atienda normal el resto
function fallarMetodo(metodo: string, estado: number) {
    const original = backend().responder.bind(backend());
    spyOn(backend(), "responder").and.callFake((entrada: RequestInfo | URL, init?: RequestInit) =>
        init?.method === metodo ? Promise.resolve(new Response(null, { status: estado })) : original(entrada, init)
    );
}

describe("Panel → Contactos (microservicio ms-contactos)", () => {
    beforeEach(() => {
        reiniciarDatos();
        backend().contactos = [{ ...pendiente }, { ...atendido }];
    });

    it("el vendedor ve la opción Contactos en el menú del panel", async () => {
        iniciarSesionComo("vendedor");
        await renderizarApp("/admin");
        const menu = within(screen.getByRole("navigation", { name: "Menú del panel" }));
        expect(menu.getByRole("link", { name: "Contactos" })).toBeTruthy();
    });

    it("lista los mensajes traídos del backend (GET) y cuenta los pendientes", async () => {
        iniciarSesionComo("administrador");
        await renderizarApp("/admin/contactos");
        expect(screen.getByText("Tomás Vera")).toBeTruthy();
        expect(screen.getByText("Camila Soto")).toBeTruthy();
        expect(screen.getByText("1 pendientes")).toBeTruthy();
        expect(screen.getAllByText("Consulta de stock o precio").length).toBeGreaterThan(0);
    });

    it("un cliente no puede entrar al panel de contactos", async () => {
        iniciarSesionComo("cliente");
        await renderizarApp("/admin/contactos");
        expect(screen.getByText("Acceso denegado")).toBeTruthy();
    });

    it("filtra por estado", async () => {
        iniciarSesionComo("administrador");
        await renderizarApp("/admin/contactos");
        fireEvent.change(screen.getByLabelText("Filtrar mensajes por estado"), { target: { value: "ATENDIDO" } });
        expect(screen.queryByText("Tomás Vera")).toBeNull();
        expect(screen.getByText("Camila Soto")).toBeTruthy();
    });

    it("marca un mensaje como atendido (PUT) y recarga el listado", async () => {
        iniciarSesionComo("vendedor");
        await renderizarApp("/admin/contactos");

        fireEvent.click(screen.getByRole("button", { name: "Marcar como atendido el mensaje de Tomás Vera" }));
        await esperarBackend();

        expect(screen.getByText("Mensaje de Tomás Vera marcado como atendido.")).toBeTruthy();
        expect(window.fetch).toHaveBeenCalledWith(URL_API_CONTACTOS + "/1/atendido", jasmine.objectContaining({ method: "PUT" }));
        expect(backend().contactos.find((c) => c.id === 1)?.estado).toBe("ATENDIDO");
        expect(screen.getByText("0 pendientes")).toBeTruthy();
    });

    it("elimina un mensaje (DELETE) solo si se confirma", async () => {
        const confirmar = spyOn(window, "confirm").and.returnValues(false, true);
        iniciarSesionComo("administrador");
        await renderizarApp("/admin/contactos");
        const boton = screen.getByRole("button", { name: "Eliminar el mensaje de Tomás Vera" });

        fireEvent.click(boton); // el usuario cancela
        await esperarBackend();
        expect(confirmar).toHaveBeenCalledTimes(1);
        expect(backend().contactos.length).toBe(2);

        fireEvent.click(boton); // el usuario acepta
        await esperarBackend();
        expect(screen.getByText("Mensaje de Tomás Vera eliminado.")).toBeTruthy();
        expect(backend().contactos.map((c) => c.id)).toEqual([2]);
        expect(screen.queryByText("Tomás Vera")).toBeNull();
    });

    it("si ms-contactos está apagado muestra el error y permite reintentar", async () => {
        backend().apagar(URL_CONTACTOS);
        iniciarSesionComo("administrador");
        await renderizarApp("/admin/contactos");
        expect(screen.getByText(/No se pudo conectar con el servidor de contactos/)).toBeTruthy();

        backend().apagados.clear();
        fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
        await esperarBackend();
        expect(screen.getByText("Tomás Vera")).toBeTruthy();
    });

    it("si falla una acción muestra el error sin perder el listado", async () => {
        iniciarSesionComo("administrador");
        await renderizarApp("/admin/contactos");

        fallarMetodo("PUT", 500);
        fireEvent.click(screen.getByRole("button", { name: "Marcar como atendido el mensaje de Tomás Vera" }));
        await esperarBackend();
        expect(screen.getByText(/No se pudo actualizar el mensaje/)).toBeTruthy();
        expect(screen.getByText("Tomás Vera")).toBeTruthy();
    });

    it("si falla la eliminación muestra el error", async () => {
        iniciarSesionComo("administrador");
        await renderizarApp("/admin/contactos");
        spyOn(window, "confirm").and.returnValue(true);
        fallarMetodo("DELETE", 404);
        fireEvent.click(screen.getByRole("button", { name: "Eliminar el mensaje de Tomás Vera" }));
        await esperarBackend();
        expect(screen.getByText(/No se pudo eliminar el mensaje/)).toBeTruthy();
    });
});
