import { Link } from "react-router-dom";
import { useSesion } from "../../contexto/useSesion";
import { CATALOGO_PUBLICO, proyecto, tienda } from "../../datos/tienda";

function Footer() {
    const { usuario } = useSesion();
    const mostrarEnlaces = usuario !== null || CATALOGO_PUBLICO;

    return (
        <footer className="pie-pagina mt-5">
            <div className="container py-4">
                <div className="row g-4">
                    <div className="col-12 col-md-4">
                        <h2 className="h5">{tienda.nombre}</h2>
                        <p className="mb-1">{tienda.slogan}</p>
                        <p className="mb-0 small">
                            {tienda.direccion}, {tienda.region}
                        </p>
                    </div>
                    <div className="col-6 col-md-4">
                        <h2 className="h6">Contacto</h2>
                        <ul className="list-unstyled small mb-0">
                            <li>Tel: {tienda.telefono}</li>
                            <li>WhatsApp: {tienda.whatsapp}</li>
                            <li>{tienda.correo}</li>
                            <li>{tienda.horario}</li>
                        </ul>
                    </div>
                    {mostrarEnlaces && (
                        <div className="col-6 col-md-4">
                            <h2 className="h6">Enlaces</h2>
                            <ul className="list-unstyled small mb-0">
                                <li><Link to="/productos">Catálogo</Link></li>
                                <li><Link to="/carrito">Carrito</Link></li>
                                <li><Link to="/nosotros">Nosotros</Link></li>
                                <li><Link to="/contacto">Contacto y ubicación</Link></li>
                            </ul>
                        </div>
                    )}
                </div>
                <hr />
                <div className="d-flex flex-column flex-md-row justify-content-between small gap-2">
                    <span>
                        &copy; {new Date().getFullYear()} {tienda.nombre}. Proyecto académico {proyecto.asignatura} – {proyecto.institucion}.
                    </span>
                    <span>Desarrollado por: {proyecto.integrantes.join(", ")}</span>
                </div>
            </div>
        </footer>
    );
}
export default Footer;
