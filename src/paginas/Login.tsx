import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSesion } from "../contexto/useSesion";
import { destinoTrasLogin, etiquetasRol, usuariosIniciales } from "../datos/usuarios";
import type { DatosLogin } from "../tipos/Usuario";
import Alerta from "../componentes/atomos/Alerta";
import FormularioLogin from "../componentes/organismos/FormularioLogin";

function Login() {
    const { usuario, iniciarSesion } = useSesion();
    const navegar = useNavigate();
    const ubicacion = useLocation();
    const [error, setError] = useState("");

    // Si venía desde una página protegida, vuelve a ella después del login
    const desde = (ubicacion.state as { desde?: string } | null)?.desde;

    if (usuario) {
        return <Navigate to={destinoTrasLogin(desde, usuario.rol)} replace />;
    }

    const ingresar = (datos: DatosLogin) => {
        const resultado = iniciarSesion(datos.correo, datos.clave);
        if (!resultado.ok || !resultado.usuario) {
            setError(resultado.mensaje);
            return;
        }
        navegar(destinoTrasLogin(desde, resultado.usuario.rol), { replace: true });
    };

    return (
        <section className="container py-5">
            <div className="row justify-content-center g-4">
                <div className="col-12 col-md-7 col-lg-5">
                    <div className="card">
                        <div className="card-body p-4">
                            <h1 className="h3 mb-3">Iniciar sesión</h1>
                            {desde && <Alerta texto="Inicia sesión o crea una cuenta para continuar." tipo="info" />}
                            <Alerta texto={error} tipo="danger" alCerrar={() => setError("")} />
                            <FormularioLogin alIngresar={ingresar} />
                            <p className="mt-3 mb-0 small">
                                ¿No tienes cuenta? <Link to="/registro" state={{ desde }}>Regístrate aquí</Link>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-5 col-lg-4">
                    <div className="card bg-body-tertiary">
                        <div className="card-body small">
                            <h2 className="h6">Usuarios de prueba</h2>
                            <ul className="list-unstyled mb-0">
                                {usuariosIniciales.map((u) => (
                                    <li key={u.id} className="mb-2">
                                        <strong>{etiquetasRol[u.rol]}:</strong> {u.correo}
                                        <br />
                                        Contraseña: <code>{u.clave}</code>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
export default Login;
