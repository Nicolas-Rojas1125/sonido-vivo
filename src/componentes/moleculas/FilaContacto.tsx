import { etiquetaAsunto } from "../../datos/contacto";
import type { MensajeContacto } from "../../tipos/Contacto";
import { formatearFecha } from "../../utilidades/formato";
import Boton from "../atomos/Boton";
import Insignia from "../atomos/Insignia";

type Props = {
    contacto: MensajeContacto;
    ocupado: boolean; // true mientras se procesa una petición (evita dobles clics)
    alMarcarAtendido: (id: number) => void;
    alEliminar: (contacto: MensajeContacto) => void;
};

// Una fila de la tabla de mensajes de contacto del panel
function FilaContacto({ contacto, ocupado, alMarcarAtendido, alEliminar }: Props) {
    const atendido = contacto.estado === "ATENDIDO";

    return (
        <tr className={atendido ? "text-body-secondary" : ""}>
            <td className="text-nowrap small">{formatearFecha(contacto.fechaCreacion)}</td>
            <td>
                {contacto.nombreCompleto}
                <div className="small">
                    <a href={"mailto:" + contacto.correo}>{contacto.correo}</a>
                </div>
                {contacto.telefono && <div className="small text-body-secondary">{contacto.telefono}</div>}
            </td>
            <td className="d-none d-lg-table-cell">{etiquetaAsunto(contacto.asunto)}</td>
            <td className="mensaje-contacto">
                <div className="small text-body-secondary d-lg-none">{etiquetaAsunto(contacto.asunto)}</div>
                {contacto.mensaje}
            </td>
            <td>
                <Insignia texto={atendido ? "Atendido" : "Pendiente"} color={atendido ? "success" : "warning"} />
            </td>
            <td>
                <div className="d-flex flex-column flex-xl-row gap-2 justify-content-end">
                    <Boton
                        texto="Marcar atendido"
                        variante="success"
                        tamano="sm"
                        deshabilitado={atendido || ocupado}
                        etiquetaAria={"Marcar como atendido el mensaje de " + contacto.nombreCompleto}
                        alClick={() => alMarcarAtendido(contacto.id)}
                    />
                    <Boton
                        texto="Eliminar"
                        variante="danger"
                        tamano="sm"
                        deshabilitado={ocupado}
                        etiquetaAria={"Eliminar el mensaje de " + contacto.nombreCompleto}
                        alClick={() => alEliminar(contacto)}
                    />
                </div>
            </td>
        </tr>
    );
}
export default FilaContacto;
