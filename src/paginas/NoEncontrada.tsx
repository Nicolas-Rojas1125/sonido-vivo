import { Link } from "react-router-dom";

function NoEncontrada() {
    return (
        <section className="container py-5 text-center">
            <p className="display-1 fw-bold text-marca mb-0">404</p>
            <h1 className="h3">Página no encontrada</h1>
            <p>La dirección que ingresaste no existe.</p>
            <Link className="btn btn-marca" to="/">
                Volver al inicio
            </Link>
        </section>
    );
}
export default NoEncontrada;
