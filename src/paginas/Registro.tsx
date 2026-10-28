import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSesion } from "../contexto/useSesion";
import { destinoTrasLogin } from "../datos/usuarios";
import type { DatosNuevoUsuario } from "../servicios/usuariosServicio";
import Alerta from "../componentes/atomos/Alerta";
import FormularioUsuario from "../componentes/organismos/FormularioUsuario";

function Registro() {
    const { usuario, registrar } = useSesion();
    const navegar = useNavigate();
    const ubicacion = useLocation();
    const [error, setError] = useState("");
    const desde = (ubicacion.state as { desde?: string } | null)?.desde;

    if (usuario) {
        return <Navigate to={destinoTrasLogin(desde, usuario.rol)} replace />;
    }

    const guardar = (datos: DatosNuevoUsuario) => {
        const resultado = registrar({ rut: datos.rut, nombre: datos.nombre, correo: datos.correo, clave: datos.clave });
        if (!resultado.ok) {
            setError(resultado.mensaje);
            return;
        }
        navegar(destinoTrasLogin(desde, "cliente"), { replace: true });
    };

    return (
        <section className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-9 col-lg-6">
                    <div className="card">
                        <div className="card-body p-4">
                            <h1 className="h3">Crear cuenta</h1>
                            <p className="text-body-secondary">Regístrate para comprar online y revisar el estado de tus pedidos.</p>
                            <Alerta texto={error} tipo="danger" alCerrar={() => setError("")} />
                            <FormularioUsuario modo="registro" textoBoton="Crear mi cuenta" alGuardar={guardar} />
                            <p className="mt-3 mb-0 small">
                                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
export default Registro;
