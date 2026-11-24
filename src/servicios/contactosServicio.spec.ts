import { respuestaJson } from "../test/utilidades";
import { tokenEnMemoria } from "./api";
import type { MensajeContacto } from "../tipos/Contacto";
import { contactosServicio, URL_API_CONTACTOS } from "./contactosServicio";

// En estas pruebas NO se necesita el backend encendido: se reemplaza fetch por un MOCK (spyOn)
// y se revisa que el servicio haga la petición correcta (URL, método HTTP y cuerpo JSON).

const contactoGuardado: MensajeContacto = {
    id: 7,
    nombreCompleto: "Camila Soto",
    correo: "camila@correo.cl",
    telefono: null,
    asunto: "stock",
    mensaje: "¿Tienen stock del pedal Boss DS-1?",
    estado: "PENDIENTE",
    fechaCreacion: "2026-11-17T11:47:31.775593",
};

describe("Servicio de contactos (API REST Spring Boot)", () => {
    afterEach(() => tokenEnMemoria.limpiar());

    it("envía el token JWT en el header Authorization", async () => {
        tokenEnMemoria.guardar("token-de-prueba");
        const fetchFalso = spyOn(window, "fetch").and.resolveTo(respuestaJson([]));
        await contactosServicio.listar();
        const opciones = fetchFalso.calls.mostRecent().args[1] as RequestInit;
        expect((opciones.headers as Record<string, string>)["Authorization"]).toBe("Bearer token-de-prueba");
    });

    it("enviar: hace POST con JSON y los nombres de la entidad Contacto.java", async () => {
        const fetchFalso = spyOn(window, "fetch").and.resolveTo(respuestaJson(contactoGuardado, 201));

        const resultado = await contactosServicio.enviar({
            nombre: "  Camila Soto ",
            correo: "camila@correo.cl",
            telefono: "",
            asunto: "stock",
            mensaje: "¿Tienen stock del pedal Boss DS-1?",
        });

        const [url, opciones] = fetchFalso.calls.mostRecent().args as [string, RequestInit];
        expect(url).toBe(URL_API_CONTACTOS);
        expect(opciones.method).toBe("POST");
        expect(JSON.parse(opciones.body as string)).toEqual({
            nombreCompleto: "Camila Soto",
            correo: "camila@correo.cl",
            telefono: "",
            asunto: "stock",
            mensaje: "¿Tienen stock del pedal Boss DS-1?",
        });
        expect(resultado.id).toBe(7);
        expect(resultado.estado).toBe("PENDIENTE");
    });

    it("enviar: si el backend responde 400 lanza un error", async () => {
        spyOn(window, "fetch").and.resolveTo(respuestaJson({ correo: "El correo no es válido" }, 400));
        await expectAsync(
            contactosServicio.enviar({ nombre: "Ana", correo: "malo", telefono: "", asunto: "otro", mensaje: "1234567890" })
        ).toBeRejectedWith(jasmine.objectContaining({ estado: 400 }));
    });

    it("listar: hace GET y devuelve la lista", async () => {
        const fetchFalso = spyOn(window, "fetch").and.resolveTo(respuestaJson([contactoGuardado]));
        const lista = await contactosServicio.listar();
        expect(fetchFalso.calls.mostRecent().args[0]).toBe(URL_API_CONTACTOS);
        expect(lista.length).toBe(1);
        expect(lista[0].nombreCompleto).toBe("Camila Soto");
    });

    it("marcarAtendido: hace PUT a /{id}/atendido", async () => {
        const fetchFalso = spyOn(window, "fetch").and.resolveTo(respuestaJson({ ...contactoGuardado, estado: "ATENDIDO" }));
        const actualizado = await contactosServicio.marcarAtendido(7);
        expect(fetchFalso).toHaveBeenCalledOnceWith(URL_API_CONTACTOS + "/7/atendido", jasmine.objectContaining({ method: "PUT" }));
        expect(actualizado.estado).toBe("ATENDIDO");
    });

    it("eliminar: hace DELETE a /{id} y acepta la respuesta 204 sin contenido", async () => {
        const fetchFalso = spyOn(window, "fetch").and.resolveTo(respuestaJson(null, 204));
        await expectAsync(contactosServicio.eliminar(7)).toBeResolved();
        expect(fetchFalso).toHaveBeenCalledOnceWith(URL_API_CONTACTOS + "/7", jasmine.objectContaining({ method: "DELETE" }));
    });

    it("eliminar: si el id no existe (404) lanza un error", async () => {
        spyOn(window, "fetch").and.resolveTo(respuestaJson(null, 404));
        await expectAsync(contactosServicio.eliminar(99)).toBeRejectedWithError("El recurso solicitado no existe.");
    });
});
