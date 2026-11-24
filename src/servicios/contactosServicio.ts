// Servicio de contactos: se comunica con el microservicio "ms-contactos" mediante la API REST.
// Usa el cliente de api.ts, que agrega el token JWT y lo renueva si expiró.
//
//   POST   /api/contactos               -> registra un nuevo mensaje (cualquier usuario con sesión)
//   GET    /api/contactos               -> lista todos los mensajes (Administrador y Vendedor)
//   PUT    /api/contactos/{id}/atendido -> cambia el estado a ATENDIDO (Administrador y Vendedor)
//   DELETE /api/contactos/{id}          -> elimina el mensaje (Administrador y Vendedor)

import type { DatosContacto, MensajeContacto } from "../tipos/Contacto";
import { api, URL_CONTACTOS } from "./api";

// Dirección del microservicio (puerto definido en application.properties: server.port=8082)
export const URL_API_CONTACTOS = URL_CONTACTOS + "/contactos";

export const contactosServicio = {
    // POST: envía los datos del formulario. Devuelve el contacto guardado (con id, estado y fecha)
    enviar(datos: DatosContacto): Promise<MensajeContacto> {
        // Los nombres de las propiedades deben coincidir con los atributos de la entidad Contacto.java
        return api.post<MensajeContacto>(URL_API_CONTACTOS, {
            nombreCompleto: datos.nombre.trim(),
            correo: datos.correo.trim(),
            telefono: datos.telefono.trim(),
            asunto: datos.asunto,
            mensaje: datos.mensaje.trim(),
        });
    },

    // GET: consulta todos los mensajes guardados (los más recientes primero)
    listar(): Promise<MensajeContacto[]> {
        return api.get<MensajeContacto[]>(URL_API_CONTACTOS);
    },

    // PUT: marca el mensaje como ATENDIDO
    marcarAtendido(id: number): Promise<MensajeContacto> {
        return api.put<MensajeContacto>(`${URL_API_CONTACTOS}/${id}/atendido`);
    },

    // DELETE: elimina el mensaje (el backend responde 204 sin contenido)
    eliminar(id: number): Promise<void> {
        return api.delete<void>(`${URL_API_CONTACTOS}/${id}`);
    },
};
