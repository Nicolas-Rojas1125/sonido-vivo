import { useState } from "react";

export const IMAGEN_RESPALDO = "/imagenes/sin-imagen.svg";

type Props = {
    src: string;
    alt: string;
    clase?: string;
};

// Imagen con respaldo: si la foto no existe (todavía no la agregas a /public/imagenes),
// se muestra una imagen genérica en lugar de un ícono roto.
function ImagenProducto({ src, alt, clase = "" }: Props) {
    // Guarda qué ruta falló; si cambia "src" (otro producto), se vuelve a intentar con la nueva
    const [srcFallido, setSrcFallido] = useState("");
    const usarRespaldo = src === "" || srcFallido === src;

    return (
        <img
            src={usarRespaldo ? IMAGEN_RESPALDO : src}
            alt={alt}
            className={clase}
            loading="lazy"
            onError={() => setSrcFallido(src)}
        />
    );
}
export default ImagenProducto;
