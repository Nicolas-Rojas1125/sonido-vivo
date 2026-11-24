import { useCallback, useEffect, useState } from "react";
import { contactosServicio } from "../../servicios/contactosServicio";
import type { EstadoContacto, MensajeContacto } from "../../tipos/Contacto";
import Alerta from "../../componentes/atomos/Alerta";
import Boton from "../../componentes/atomos/Boton";
import Selector from "../../componentes/atomos/Selector";
import TablaContactos from "../../componentes/organismos/TablaContactos";

type Aviso = { texto: string; tipo: "success" | "danger" };

const opcionesEstado = [
    { valor: "PENDIENTE", etiqueta: "Pendientes" },
    { valor: "ATENDIDO", etiqueta: "Atendidos" },
];

const ERROR_CONEXION =
    "No se pudo conectar con el servidor de contactos. Revisa que el microservicio ms-contactos (puerto 8082) y MySQL estén encendidos.";

// Mensajes de contacto: se leen, actualizan y eliminan en el microservicio Spring Boot (MySQL)
function AdminContactos() {
    const [contactos, setContactos] = useState<MensajeContacto[]>([]);
    const [cargando, setCargando] = useState(true);
    const [ocupado, setOcupado] = useState(false);
    const [errorCarga, setErrorCarga] = useState("");
    const [filtro, setFiltro] = useState<EstadoContacto | "">("");
    const [aviso, setAviso] = useState<Aviso>({ texto: "", tipo: "success" });

    // GET: consulta el backend y actualiza el listado
    const cargar = useCallback(async () => {
        try {
            const datos = await contactosServicio.listar();
            setContactos(datos);
            setErrorCarga("");
        } catch {
            setErrorCarga(ERROR_CONEXION);
        } finally {
            setCargando(false);
        }
    }, []);

    // Consulta el backend al abrir la página
    useEffect(() => {
        let vigente = true; // evita actualizar el estado si el usuario ya salió de la página
        contactosServicio
            .listar()
            .then((datos) => {
                if (vigente) setContactos(datos);
            })
            .catch(() => {
                if (vigente) setErrorCarga(ERROR_CONEXION);
            })
            .finally(() => {
                if (vigente) setCargando(false);
            });
        return () => {
            vigente = false;
        };
    }, []);

    const reintentar = () => {
        setCargando(true);
        void cargar();
    };

    // PUT: marca como ATENDIDO y vuelve a cargar el listado
    const marcarAtendido = async (id: number) => {
        setOcupado(true);
        try {
            const actualizado = await contactosServicio.marcarAtendido(id);
            setAviso({ texto: "Mensaje de " + actualizado.nombreCompleto + " marcado como atendido.", tipo: "success" });
        } catch {
            setAviso({ texto: "No se pudo actualizar el mensaje. " + ERROR_CONEXION, tipo: "danger" });
        } finally {
            await cargar();
            setOcupado(false);
        }
    };

    // DELETE: pide confirmación, elimina y vuelve a cargar el listado
    const eliminar = async (contacto: MensajeContacto) => {
        if (!window.confirm("¿Eliminar el mensaje de " + contacto.nombreCompleto + "? Esta acción no se puede deshacer.")) {
            return;
        }
        setOcupado(true);
        try {
            await contactosServicio.eliminar(contacto.id);
            setAviso({ texto: "Mensaje de " + contacto.nombreCompleto + " eliminado.", tipo: "success" });
        } catch {
            setAviso({ texto: "No se pudo eliminar el mensaje. " + ERROR_CONEXION, tipo: "danger" });
        } finally {
            await cargar();
            setOcupado(false);
        }
    };

    const visibles = filtro === "" ? contactos : contactos.filter((contacto) => contacto.estado === filtro);
    const pendientes = contactos.filter((contacto) => contacto.estado === "PENDIENTE").length;

    return (
        <>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h1 className="h3 mb-0">
                    Mensajes de contacto{" "}
                    {!cargando && !errorCarga && <span className="badge text-bg-warning fs-6 align-middle">{pendientes} pendientes</span>}
                </h1>
                <div style={{ minWidth: "14rem" }}>
                    <Selector
                        nombre="filtro-contactos"
                        valor={filtro}
                        textoVacio="Todos los mensajes"
                        opciones={opcionesEstado}
                        etiquetaAria="Filtrar mensajes por estado"
                        alCambiar={(valor) => setFiltro(valor as EstadoContacto | "")}
                    />
                </div>
            </div>

            <Alerta texto={aviso.texto} tipo={aviso.tipo} alCerrar={() => setAviso({ ...aviso, texto: "" })} />

            <div className="card">
                <div className="card-body">
                    {cargando && (
                        <p className="mb-0" role="status">
                            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                            Cargando mensajes...
                        </p>
                    )}
                    {!cargando && errorCarga && (
                        <div>
                            <Alerta texto={errorCarga} tipo="danger" />
                            <Boton texto="Reintentar" variante="outline-marca" alClick={reintentar} />
                        </div>
                    )}
                    {!cargando && !errorCarga && (
                        <TablaContactos
                            contactos={visibles}
                            ocupado={ocupado}
                            alMarcarAtendido={(id) => void marcarAtendido(id)}
                            alEliminar={(contacto) => void eliminar(contacto)}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
export default AdminContactos;
