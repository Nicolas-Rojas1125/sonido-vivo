export interface ImagenCarrusel {
    src: string;
    alt: string;
    titulo: string;
    texto: string;
}

// Imágenes del carrusel de la página de inicio: /public/imagenes/carrusel/
export const imagenesCarrusel: ImagenCarrusel[] = [
    {
        src: "/imagenes/carrusel/carrusel1.jpg",
        alt: "Muro de guitarras en la tienda Sonido Vivo",
        titulo: "Guitarras para cada estilo",
        texto: "Acústicas, eléctricas y bajos de Yamaha, Fender, Epiphone y más.",
    },
    {
        src: "/imagenes/carrusel/carrusel2.jpg",
        alt: "Batería y amplificadores en exhibición",
        titulo: "Arma tu sala de ensayo",
        texto: "Baterías, amplificadores y todo el sonido para tu banda.",
    },
    {
        src: "/imagenes/carrusel/carrusel3.jpg",
        alt: "Micrófono e interfaz de audio en un estudio",
        titulo: "Graba en casa",
        texto: "Micrófonos, interfaces y audífonos de estudio.",
    },
];

export interface Beneficio {
    titulo: string;
    texto: string;
    icono: string;
}

export const beneficios: Beneficio[] = [
    { icono: "🚚", titulo: "Despacho a todo Chile", texto: "Enviamos por Starken o Chilexpress con número de seguimiento." },
    { icono: "🏬", titulo: "Retiro en tienda", texto: "Compra online y retira gratis en Providencia, Santiago Centro o Las Condes." },
    { icono: "📦", titulo: "Stock en tiempo real", texto: "Lo que ves en el catálogo es lo que tenemos disponible." },
    { icono: "🔧", titulo: "Reparación de cuerdas", texto: "Servicio técnico para guitarras, bajos y otros instrumentos de cuerda." },
];

// Códigos de productos que se muestran como destacados en el inicio
export const codigosDestacados = ["GE001", "TC002", "MI001", "PE001"];
