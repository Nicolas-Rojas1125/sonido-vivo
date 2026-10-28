import { useContext } from "react";
import { SesionContexto } from "./SesionContexto";
import type { ValorSesion } from "./SesionContexto";

// Hook personalizado: cualquier componente puede llamar useSesion() para saber quién está conectado
export function useSesion(): ValorSesion {
    const contexto = useContext(SesionContexto);
    if (!contexto) {
        throw new Error("useSesion debe usarse dentro de <SesionProveedor>");
    }
    return contexto;
}
