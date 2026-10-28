import { useEffect, useState } from "react";
import type { ImagenCarrusel } from "../../datos/inicio";
import ImagenProducto from "../atomos/ImagenProducto";

type Props = {
    imagenes: ImagenCarrusel[];
    intervalo?: number; // milisegundos entre una imagen y la siguiente (0 = sin avance automático)
};

// Carrusel de Bootstrap controlado con estado de React (sin el JavaScript de Bootstrap).
// Avanza solo cada "intervalo" ms y se pausa mientras el mouse o el foco están sobre él.
function Carrusel({ imagenes, intervalo = 5000 }: Props) {
    const [indice, setIndice] = useState(0);
    const [pausado, setPausado] = useState(false);
    const total = imagenes.length;

    // Efecto: programa el cambio a la siguiente imagen.
    // Se vuelve a programar cada vez que cambia la imagen (también si el usuario usa las flechas)
    // y se limpia el temporizador al pausar o al salir de la página.
    useEffect(() => {
        if (pausado || intervalo <= 0 || total < 2) {
            return;
        }
        const temporizador = setTimeout(() => setIndice((actual) => (actual + 1) % total), intervalo);
        return () => clearTimeout(temporizador);
    }, [indice, pausado, intervalo, total]);

    if (total === 0) {
        return null;
    }

    const anterior = () => setIndice((indice - 1 + total) % total);
    const siguiente = () => setIndice((indice + 1) % total);
    const actual = imagenes[indice];

    return (
        <div
            className="carousel slide carrusel-inicio"
            aria-roledescription="carrusel"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
            onFocus={() => setPausado(true)}
            onBlur={() => setPausado(false)}
        >
            <div className="carousel-indicators">
                {imagenes.map((imagen, posicion) => (
                    <button
                        key={imagen.src}
                        type="button"
                        className={posicion === indice ? "active" : ""}
                        aria-current={posicion === indice}
                        aria-label={"Ir a la imagen " + (posicion + 1)}
                        onClick={() => setIndice(posicion)}
                    ></button>
                ))}
            </div>
            <div className="carousel-inner rounded-4" aria-live={pausado ? "polite" : "off"}>
                {/* La key cambia con cada imagen: React crea el elemento de nuevo y se repite la animación CSS */}
                <div className="carousel-item active carrusel-animado" key={actual.src}>
                    <ImagenProducto src={actual.src} alt={actual.alt} clase="d-block w-100" />
                    <div className="carousel-caption">
                        <h2 className="h4">{actual.titulo}</h2>
                        <p className="d-none d-sm-block mb-0">{actual.texto}</p>
                    </div>
                </div>
            </div>
            <button className="carousel-control-prev" type="button" onClick={anterior}>
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Anterior</span>
            </button>
            <button className="carousel-control-next" type="button" onClick={siguiente}>
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Siguiente</span>
            </button>
        </div>
    );
}
export default Carrusel;
