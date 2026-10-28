import type { ItemCarrito } from "../tipos/Pedido";
import type { Producto } from "../tipos/Producto";

// Funciones "puras" del carrito: reciben la lista actual y devuelven una lista NUEVA.
// No modifican el estado directamente, por eso son fáciles de probar y de usar con useState.

export function agregarAlCarrito(items: ItemCarrito[], producto: Producto, cantidad = 1): ItemCarrito[] {
    if (cantidad <= 0 || producto.stock <= 0) {
        return items;
    }

    const existente = items.find((item) => item.codigo === producto.codigo);

    if (existente) {
        const nuevaCantidad = Math.min(existente.cantidad + cantidad, producto.stock);
        return items.map((item) =>
            item.codigo === producto.codigo ? { ...item, cantidad: nuevaCantidad, stock: producto.stock } : item
        );
    }

    const nuevo: ItemCarrito = {
        codigo: producto.codigo,
        nombre: producto.nombre,
        marca: producto.marca,
        precio: producto.precio,
        imagen: producto.imagen,
        cantidad: Math.min(cantidad, producto.stock),
        stock: producto.stock,
    };
    return [...items, nuevo];
}

export function cambiarCantidad(items: ItemCarrito[], codigo: string, cantidad: number): ItemCarrito[] {
    if (cantidad <= 0) {
        return quitarDelCarrito(items, codigo);
    }
    return items.map((item) =>
        item.codigo === codigo ? { ...item, cantidad: Math.min(cantidad, item.stock) } : item
    );
}

export function quitarDelCarrito(items: ItemCarrito[], codigo: string): ItemCarrito[] {
    return items.filter((item) => item.codigo !== codigo);
}

export function calcularSubtotal(items: ItemCarrito[]): number {
    return items.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

export function contarUnidades(items: ItemCarrito[]): number {
    return items.reduce((total, item) => total + item.cantidad, 0);
}
