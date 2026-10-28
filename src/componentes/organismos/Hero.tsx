import { Link } from "react-router-dom";

type Props = {
    titulo: string;
    texto: string;
    textoBoton?: string;
    ruta?: string;
    compacto?: boolean;
};

function Hero({ titulo, texto, textoBoton, ruta, compacto = false }: Props) {
    return (
        <section className={"hero" + (compacto ? " hero-compacto" : "")}>
            <div className="container">
                <h1 className={compacto ? "h2" : "display-5 fw-bold"}>{titulo}</h1>
                <p className="lead mb-0">{texto}</p>
                {textoBoton && ruta && (
                    <Link to={ruta} className="btn btn-marca btn-lg mt-4">
                        {textoBoton}
                    </Link>
                )}
            </div>
        </section>
    );
}
export default Hero;
