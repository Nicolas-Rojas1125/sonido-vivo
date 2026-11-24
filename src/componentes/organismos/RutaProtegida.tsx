import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useSesion } from "../../contexto/useSesion";
import type { Rol } from "../../tipos/Usuario";
import EstadoCarga from "../moleculas/EstadoCarga";

type Props = {
    roles: Rol[];
    children: ReactNode;
};

// Protege una vista según el rol:
//  - mientras se comprueba la sesión con el backend (al recargar) -> "Verificando sesión..."
//  - sin sesión  -> redirige al login (y después vuelve a la página que pedía)
//  - rol incorrecto -> muestra "Acceso denegado"
// OJO: esto protege la INTERFAZ. La seguridad real está en el backend: aunque alguien
// saltara esta protección, cada microservicio rechaza la petición (401/403) sin el token y rol correctos.
function RutaProtegida({ roles, children }: Props) {
    const { usuario, cargando } = useSesion();
    const ubicacion = useLocation();

    if (cargando) {
        return <EstadoCarga cargando error="" texto="Verificando sesión..." />;
    }

    if (!usuario) {
        return <Navigate to="/login" replace state={{ desde: ubicacion.pathname + ubicacion.search }} />;
    }

    if (!roles.includes(usuario.rol)) {
        return (
            <section className="container py-5 text-center">
                <h1 className="h3">Acceso denegado</h1>
                <p>Tu cuenta no tiene permisos para ver esta página.</p>
                <Link className="btn btn-marca" to="/">
                    Volver al inicio
                </Link>
            </section>
        );
    }

    return <>{children}</>;
}
export default RutaProtegida;
