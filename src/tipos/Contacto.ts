// Datos que escribe el cliente en el formulario de contacto
export interface DatosContacto {
    nombre: string;
    correo: string;
    telefono: string;
    asunto: string;
    mensaje: string;
}

export type ErroresContacto = Partial<Record<keyof DatosContacto, string>>;

// Estados que maneja el microservicio de contactos (columna "estado" de la tabla contacto)
export type EstadoContacto = "PENDIENTE" | "ATENDIDO";

// Mensaje de contacto tal como lo guarda y devuelve el backend Spring Boot (JSON)
export interface MensajeContacto {
    id: number;
    nombreCompleto: string;
    correo: string;
    telefono: string | null;
    asunto: string;
    mensaje: string;
    estado: EstadoContacto;
    fechaCreacion: string; // fecha ISO, ej: "2026-11-17T11:47:31.775593"
}
