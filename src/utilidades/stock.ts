import { STOCK_CRITICO } from "../datos/tienda";
import type { EstadoStock } from "../tipos/Producto";

export function obtenerEstadoStock(stock: number): EstadoStock {
    if (stock <= 0) {
        return "agotado";
    }
    if (stock <= STOCK_CRITICO) {
        return "pocas";
    }
    return "disponible";
}

export const textoEstadoStock: Record<EstadoStock, string> = {
    disponible: "Disponible",
    pocas: "Últimas unidades",
    agotado: "Agotado",
};

// Clase de color de Bootstrap para cada estado
export const colorEstadoStock: Record<EstadoStock, string> = {
    disponible: "success",
    pocas: "warning",
    agotado: "secondary",
};
