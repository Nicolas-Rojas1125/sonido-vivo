import type { CategoriaFiltro, Producto } from "../tipos/Producto";

export type Orden = "relevancia" | "precio-asc" | "precio-desc" | "nombre";

// Filtra por categoría y por texto (nombre, marca, modelo o código)
export function filtrarProductos(productos: Producto[], categoria: CategoriaFiltro, busqueda: string): Producto[] {
    const texto = busqueda.trim().toLowerCase();

    return productos.filter((producto) => {
        const coincideCategoria = categoria === "todos" || producto.categoria === categoria;
        const coincideBusqueda =
            texto === "" ||
            producto.nombre.toLowerCase().includes(texto) ||
            producto.marca.toLowerCase().includes(texto) ||
            producto.modelo.toLowerCase().includes(texto) ||
            producto.codigo.toLowerCase().includes(texto);
        return coincideCategoria && coincideBusqueda;
    });
}

// Devuelve una copia ordenada (no modifica el arreglo original)
export function ordenarProductos(productos: Producto[], orden: Orden): Producto[] {
    const copia = [...productos];
    if (orden === "precio-asc") {
        copia.sort((a, b) => a.precio - b.precio);
    } else if (orden === "precio-desc") {
        copia.sort((a, b) => b.precio - a.precio);
    } else if (orden === "nombre") {
        copia.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    }
    return copia;
}
