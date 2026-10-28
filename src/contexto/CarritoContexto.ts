import { createContext } from "react";
import type { ItemCarrito } from "../tipos/Pedido";
import type { Producto } from "../tipos/Producto";

// Estado GLOBAL del carrito de compras (reemplaza al carrito en JavaScript de la plantilla HTML)
export interface ValorCarrito {
    items: ItemCarrito[];
    unidades: number;
    subtotal: number;
    agregar: (producto: Producto, cantidad?: number) => void;
    cambiarCantidad: (codigo: string, cantidad: number) => void;
    quitar: (codigo: string) => void;
    vaciar: () => void;
}

export const CarritoContexto = createContext<ValorCarrito | null>(null);
