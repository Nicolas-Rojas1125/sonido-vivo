import type { ReactNode } from "react";
import ImagenProducto from "../atomos/ImagenProducto";

type Props = {
    titulo: string;
    texto: string;
    imagen?: string;
    icono?: string;
    alt?: string;
    children?: ReactNode;
};

// Tarjeta genérica de información (beneficios, misión, visión, valores)
function CardInfo({ titulo, texto, imagen, icono, alt, children }: Props) {
    return (
        <article className="card h-100 tarjeta-info">
            {imagen && <ImagenProducto src={imagen} alt={alt ?? titulo} clase="card-img-top" />}
            <div className="card-body">
                {icono && (
                    <div className="icono-info" aria-hidden="true">
                        {icono}
                    </div>
                )}
                <h3 className="h5 card-title">{titulo}</h3>
                <p className="card-text">{texto}</p>
                {children}
            </div>
        </article>
    );
}
export default CardInfo;
