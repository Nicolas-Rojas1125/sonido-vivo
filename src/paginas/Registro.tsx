import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSesion } from "../contexto/useSesion";
import { destinoTrasLogin } from "../datos/usuarios";
import type { DatosNuevoUsuario } from "../servicios/usuariosServicio";
import Alerta from "../componentes/atomos/Alerta";
import EstadoCarga from "../componentes/moleculas/EstadoCarga";
import FormularioUsuario from "../componentes/organismos/FormularioUsuario";

function Registro() {
    const { usuario, cargando, registrar } = useSesion();
    const navegar = useNavigate();
    const ubicacion = useLocation();
    const [error, setError] = useState("");
    const [procesando, setProcesando] = useState(false);
    const desde = (ubicacion.state as { desde?: string } | null)?.desde;

    if (cargando) {
        return <EstadoCarga cargando error="" texto="Verificando sesión..." />;
    }

    if (usuario) {
        return <Navigate to={destinoTrasLogin(desde, usuario.rol)} replace />;
    }

    // POST /api/auth/registro en ms-usuarios (el backend siempre crea un CLIENTE)
    const guardar = async (datos: DatosNuevoUsuario) => {
        setProcesando(true);
        setError("");
        const resultado = await registrar({ rut: datos.rut, nombre: datos.nombre, correo: datos.correo, clave: datos.clave });
        setProcesando(false);
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
                            {desde === "/checkout" && <Alerta texto="Crea tu cuenta para finalizar la compra. Tu carrito se mantiene." tipo="info" />}
                            <Alerta texto={error} tipo="danger" alCerrar={() => setError("")} />
                            <FormularioUsuario modo="registro" textoBoton="Crear mi cuenta" alGuardar={(datos) => void guardar(datos)} procesando={procesando} />
                            <p className="mt-3 mb-0 small">
                                ¿Ya tienes cuenta? <Link to="/login" state={{ desde }}>Inicia sesión</Link>
                            </p>
                            <p className="mt-2 mb-0 small">
                                <Link to="/productos">Seguir como invitado</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
export default Registro;
