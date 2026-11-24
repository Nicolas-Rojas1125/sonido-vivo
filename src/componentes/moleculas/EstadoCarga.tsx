import Alerta from "../atomos/Alerta";
import Boton from "../atomos/Boton";

type Props = {
    cargando: boolean;
    error: string;
    alReintentar?: () => void;
    texto?: string;
};

// Muestra "Cargando..." mientras llega la respuesta del backend, o el error con un botón para reintentar.
// Si no está cargando y no hay error, no muestra nada.
function EstadoCarga({ cargando, error, alReintentar, texto = "Cargando..." }: Props) {
    if (cargando) {
        return (
            <p className="py-3 mb-0" role="status">
                <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                {texto}
            </p>
        );
    }
    if (error) {
        return (
            <div className="py-2">
                <Alerta texto={error} tipo="danger" />
                {alReintentar && <Boton texto="Reintentar" variante="outline-marca" alClick={alReintentar} />}
            </div>
        );
    }
    return null;
}
export default EstadoCarga;
