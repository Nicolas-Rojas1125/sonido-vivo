import { useCallback, useEffect, useState } from "react";
import { mensajeDeError } from "./api";

// Hook para cargar datos del backend al abrir una página.
// Devuelve { datos, cargando, error, recargar }.
//   - "clave": si cambia (ej: el código del producto de la URL), se vuelve a cargar.
//   - "recargar()": vuelve a pedir los datos (ej: después de guardar o eliminar).
export function useCargar<T>(cargar: () => Promise<T>, clave = "") {
    const [estado, setEstado] = useState<{ datos: T | null; cargando: boolean; error: string }>({
        datos: null,
        cargando: true,
        error: "",
    });
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let vigente = true; // evita actualizar el estado si el usuario ya salió de la página
        cargar()
            .then((datos) => {
                if (vigente) setEstado({ datos, cargando: false, error: "" });
            })
            .catch((error: unknown) => {
                if (vigente) setEstado({ datos: null, cargando: false, error: mensajeDeError(error) });
            });
        return () => {
            vigente = false;
        };
        // "cargar" cambia en cada render (es una función nueva); se vuelve a cargar solo si cambia la clave o se pide recargar
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clave, version]);

    const recargar = useCallback(() => setVersion((v) => v + 1), []);

    return { ...estado, recargar };
}
