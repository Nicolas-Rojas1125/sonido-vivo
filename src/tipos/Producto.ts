// Categorías del catálogo de Sonido Vivo (hoja "Categorías" del Excel entregado)
export type Categoria =
    | "guitarras-acusticas"
    | "guitarras-electricas"
    | "bajos"
    | "baterias"
    | "teclados"
    | "amplificadores"
    | "microfonos"
    | "pedales"
    | "accesorios"
    | "estudio";

export type CategoriaFiltro = Categoria | "todos";

export interface Producto {
    codigo: string; // Ej: "GA001" (columna Código del Excel). Se usa como identificador y nombre de la imagen
    categoria: Categoria;
    nombre: string;
    marca: string;
    modelo: string;
    stock: number;
    precio: number; // en pesos chilenos (CLP)
    descripcion: string;
    imagen: string; // ruta dentro de /public, ej: "/imagenes/productos/GA001.jpg"
}

// Datos que llegan desde el formulario (todo es texto hasta validarlo)
export interface FormularioProductoDatos {
    codigo: string;
    categoria: string;
    nombre: string;
    marca: string;
    modelo: string;
    stock: string;
    precio: string;
    descripcion: string;
}

export type ErroresProducto = Partial<Record<keyof FormularioProductoDatos, string>>;

export type EstadoStock = "disponible" | "pocas" | "agotado";
