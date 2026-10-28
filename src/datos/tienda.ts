// =====================================================================
// DATOS DE LA TIENDA Y DEL PROYECTO
// Edita este archivo para cambiar la información que aparece en el
// encabezado, footer, página de contacto, mapa y página "Nosotros".
// =====================================================================

export const tienda = {
    nombre: "Sonido Vivo",
    slogan: "Instrumentos, sonido y accesorios para músicos",
    direccion: "Av. Providencia 2216, Edificio Dos Caracoles, Providencia",
    region: "Región Metropolitana, Chile",
    telefono: "+56 32 268 1234",
    whatsapp: "+56 9 8765 4321",
    correo: "contacto@sonidovivo.cl",
    instagram: "@sonidovivo.vina",
    horario: "Lunes a sábado, 10:00 a 20:00 hrs.",
    aniosFuncionamiento: 11,
    // Coordenadas de la tienda física para el mapa (latitud, longitud)
    coordenadas: [-33.421322, -70.609664] as [number, number], // Edificio Dos Caracoles (Metro Los Leones)
};

// Datos del proyecto académico (aparecen en el footer)
export const proyecto = {
    asignatura: "DSY1104 Desarrollo Fullstack II",
    institucion: "Duoc UC",
    integrantes: ["Nicolás Rojas"],
    repositorio: "https://github.com/Nicolas-Rojas1125/sonido-vivo",
};

export interface PuntoRetiro {
    id: string;
    nombre: string;
    direccion: string;
    horario: string;
    coordenadas: [number, number];
}

// Puntos donde el cliente puede retirar su pedido (se muestran en el mapa y en el checkout)
export const puntosRetiro: PuntoRetiro[] = [
    {
        id: "tienda",
        nombre: "Tienda Sonido Vivo (Providencia)",
        direccion: tienda.direccion,
        horario: tienda.horario,
        coordenadas: tienda.coordenadas,
    },
    {
        id: "santiago-centro",
        nombre: "Punto de retiro Santiago Centro",
        direccion: "Paseo Ahumada 312, Santiago",
        horario: "Lunes a viernes, 10:00 a 18:00 hrs.",
        coordenadas: [-33.4395, -70.6505],
    },
    {
        id: "las-condes",
        nombre: "Punto de retiro Las Condes",
        direccion: "Av. Apoquindo 4500, Las Condes",
        horario: "Lunes a viernes, 10:00 a 18:00 hrs.",
        coordenadas: [-33.4138, -70.5845],
    },
];

// Regla de seguridad del caso (sección 0.2): "ninguna vista ni endpoint del sistema debe estar
// accesible sin autenticación, excepto las pantallas de inicio de sesión y registro público".
// Por eso está en false. Cámbialo a true SOLO si tu docente permite ver la tienda sin cuenta.
export const CATALOGO_PUBLICO = false;

// Costo fijo de despacho a domicilio (Starken / Chilexpress). El retiro en tienda es gratis.
export const COSTO_DESPACHO = 5990;

// Bajo esta cantidad se considera "últimas unidades" (alerta de stock crítico para el dueño)
export const STOCK_CRITICO = 2;
