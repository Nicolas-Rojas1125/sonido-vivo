import { startTransition, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCarrito } from "../../contexto/useCarrito";
import { useSesion } from "../../contexto/useSesion";
import { CATALOGO_PUBLICO, tienda } from "../../datos/tienda";

type Enlace = { ruta: string; texto: string };

const enlacesPublicos: Enlace[] = [
    { ruta: "/", texto: "Inicio" },
    { ruta: "/productos", texto: "Catálogo" },
    { ruta: "/nosotros", texto: "Nosotros" },
    { ruta: "/contacto", texto: "Contacto" },
];

function Navbar() {
    const [abierto, setAbierto] = useState(false);
    const { usuario, cerrarSesion, tieneRol } = useSesion();
    const { unidades } = useCarrito();
    const navegar = useNavigate();

    // Sin sesión (y con la tienda privada) solo se muestran "Iniciar sesión" y "Crear cuenta"
    const mostrarTienda = usuario !== null || CATALOGO_PUBLICO;

    // Los enlaces cambian según el rol del usuario conectado
    const enlaces: Enlace[] = mostrarTienda ? [...enlacesPublicos] : [];
    if (tieneRol("cliente")) {
        enlaces.push({ ruta: "/mis-pedidos", texto: "Mis pedidos" });
    }
    if (tieneRol("administrador", "vendedor")) {
        enlaces.push({ ruta: "/admin", texto: "Panel" });
    }

    const cerrar = () => setAbierto(false);

    const salir = () => {
        cerrar();
        // startTransition agrupa ambos cambios en un solo render: así se va directo al login
        // (sin pasar por la redirección de la página protegida en la que estaba)
        startTransition(() => {
            cerrarSesion();
            navegar("/login");
        });
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark barra-navegacion" aria-label="Navegación principal">
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center gap-2" to="/" onClick={cerrar}>
                    <span className="logo-marca" aria-hidden="true">
                        ♪
                    </span>
                    {tienda.nombre}
                </Link>

                <div className="d-flex align-items-center gap-2 order-lg-last">
                    {mostrarTienda && (
                        <Link
                            to="/carrito"
                            className="btn btn-outline-light btn-sm position-relative boton-carrito"
                            aria-label={"Carrito de compras, " + unidades + " productos"}
                            onClick={cerrar}
                        >
                            🛒 <span className="d-none d-sm-inline">Carrito</span>
                            {unidades > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                                    {unidades}
                                </span>
                            )}
                        </Link>
                    )}
                    <button
                        className="navbar-toggler"
                        type="button"
                        aria-controls="menuPrincipal"
                        aria-expanded={abierto}
                        aria-label="Abrir menú de navegación"
                        onClick={() => setAbierto(!abierto)}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>

                <div className={"collapse navbar-collapse" + (abierto ? " show" : "")} id="menuPrincipal">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {enlaces.map((enlace) => (
                            <li className="nav-item" key={enlace.ruta}>
                                <NavLink className="nav-link" to={enlace.ruta} end={enlace.ruta === "/"} onClick={cerrar}>
                                    {enlace.texto}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                    <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2 me-lg-3 pb-3 pb-lg-0">
                        {usuario ? (
                            <>
                                <span className="navbar-text small">Hola, {usuario.nombre.split(" ")[0]}</span>
                                <button type="button" className="btn btn-sm btn-outline-light" onClick={salir}>
                                    Cerrar sesión
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink className="btn btn-sm btn-outline-light" to="/login" onClick={cerrar}>
                                    Iniciar sesión
                                </NavLink>
                                <NavLink className="btn btn-sm btn-marca" to="/registro" onClick={cerrar}>
                                    Crear cuenta
                                </NavLink>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
export default Navbar;
