export interface DatosContacto {
    nombre: string;
    correo: string;
    telefono: string;
    asunto: string;
    mensaje: string;
}

export type ErroresContacto = Partial<Record<keyof DatosContacto, string>>;
