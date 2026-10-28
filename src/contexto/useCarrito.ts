import { useContext } from "react";
import { CarritoContexto } from "./CarritoContexto";
import type { ValorCarrito } from "./CarritoContexto";

export function useCarrito(): ValorCarrito {
    const contexto = useContext(CarritoContexto);
    if (!contexto) {
        throw new Error("useCarrito debe usarse dentro de <CarritoProveedor>");
    }
    return contexto;
}
