import type { Categoria } from "../tipos/Producto";

export interface InfoCategoria {
    valor: Categoria;
    etiqueta: string; // texto corto para botones y tablas
    titulo: string; // texto largo para títulos de sección
    prefijo: string; // prefijo del código del producto en el Excel (GA001, GE001, ...)
}

// Hoja "Categorías" del Excel de Sonido Vivo
export const categorias: InfoCategoria[] = [
    { valor: "guitarras-acusticas", etiqueta: "Guitarras Acústicas", titulo: "Guitarras Acústicas", prefijo: "GA" },
    { valor: "guitarras-electricas", etiqueta: "Guitarras Eléctricas", titulo: "Guitarras Eléctricas", prefijo: "GE" },
    { valor: "bajos", etiqueta: "Bajos", titulo: "Bajos Eléctricos", prefijo: "BA" },
    { valor: "baterias", etiqueta: "Baterías", titulo: "Baterías y Percusión", prefijo: "BT" },
    { valor: "teclados", etiqueta: "Teclados", titulo: "Teclados y Pianos", prefijo: "TC" },
    { valor: "amplificadores", etiqueta: "Amplificadores", titulo: "Amplificadores", prefijo: "AM" },
    { valor: "microfonos", etiqueta: "Micrófonos", titulo: "Micrófonos", prefijo: "MI" },
    { valor: "pedales", etiqueta: "Pedales", titulo: "Pedales de Efectos", prefijo: "PE" },
    { valor: "accesorios", etiqueta: "Accesorios", titulo: "Accesorios", prefijo: "AC" },
    { valor: "estudio", etiqueta: "Estudio", titulo: "Estudio y Grabación", prefijo: "ES" },
];

export function obtenerCategoria(valor: string): InfoCategoria | undefined {
    return categorias.find((categoria) => categoria.valor === valor);
}
