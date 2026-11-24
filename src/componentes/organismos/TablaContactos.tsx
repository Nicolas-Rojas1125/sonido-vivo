import type { MensajeContacto } from "../../tipos/Contacto";
import FilaContacto from "../moleculas/FilaContacto";

type Props = {
    contactos: MensajeContacto[];
    ocupado: boolean;
    alMarcarAtendido: (id: number) => void;
    alEliminar: (contacto: MensajeContacto) => void;
};

// Tabla con los mensajes recibidos desde el formulario de contacto (datos traídos del backend)
function TablaContactos({ contactos, ocupado, alMarcarAtendido, alEliminar }: Props) {
    if (contactos.length === 0) {
        return <p className="text-body-secondary mb-0">No hay mensajes de contacto para mostrar.</p>;
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle">
                <caption className="visually-hidden">Mensajes de contacto recibidos</caption>
                <thead>
                    <tr>
                        <th scope="col">Fecha</th>
                        <th scope="col">Cliente</th>
                        <th scope="col" className="d-none d-lg-table-cell">Asunto</th>
                        <th scope="col">Mensaje</th>
                        <th scope="col">Estado</th>
                        <th scope="col" className="text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {contactos.map((contacto) => (
                        <FilaContacto
                            key={contacto.id}
                            contacto={contacto}
                            ocupado={ocupado}
                            alMarcarAtendido={alMarcarAtendido}
                            alEliminar={alEliminar}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default TablaContactos;
