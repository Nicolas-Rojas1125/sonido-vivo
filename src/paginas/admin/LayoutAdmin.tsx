import { NavLink, Outlet } from "react-router-dom";
import { useSesion } from "../../contexto/useSesion";
import { etiquetasRol } from "../../datos/usuarios";
import type { Rol } from "../../tipos/Usuario";

type EnlaceAdmin = { ruta: string; texto: string; roles: Rol[] };

// Cada opción del menú indica qué roles pueden verla (igual que las rutas en App.tsx)
const enlacesAdmin: EnlaceAdmin[] = [
    { ruta: "/admin", texto: "Resumen", roles: ["administrador", "vendedor"] },
    { ruta: "/admin/pedidos", texto: "Pedidos", roles: ["administrador", "vendedor"] },
    { ruta: "/admin/inventario", texto: "Inventario", roles: ["administrador", "vendedor"] },
    { ruta: "/admin/productos", texto: "Productos", roles: ["administrador"] },
    { ruta: "/admin/usuarios", texto: "Usuarios", roles: ["administrador"] },
];

// Plantilla del panel: menú lateral (en móvil se ve como pestañas arriba) + contenido de la sub-ruta
function LayoutAdmin() {
    const { usuario, tieneRol } = useSesion();
    const visibles = enlacesAdmin.filter((enlace) => tieneRol(...enlace.roles));

    return (
        <section className="container-fluid container-xl py-4">
            <div className="row g-4">
                <div className="col-12 col-md-3 col-xl-2">
                    <p className="small text-body-secondary mb-2">
                        Panel {usuario ? etiquetasRol[usuario.rol] : ""}
                    </p>
                    <nav aria-label="Menú del panel" className="menu-admin">
                        <ul className="nav nav-pills flex-row flex-md-column gap-1">
                            {visibles.map((enlace) => (
                                <li className="nav-item" key={enlace.ruta}>
                                    <NavLink className="nav-link" to={enlace.ruta} end={enlace.ruta === "/admin"}>
                                        {enlace.texto}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
                <div className="col-12 col-md-9 col-xl-10">
                    <Outlet />
                </div>
            </div>
        </section>
    );
}
export default LayoutAdmin;
