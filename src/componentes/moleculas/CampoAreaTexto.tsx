import AreaTexto from "../atomos/AreaTexto";
import MensajeError from "../atomos/MensajeError";

type Props = {
    etiqueta: string;
    nombre: string;
    valor: string;
    alCambiar: (valor: string) => void;
    error?: string;
    placeholder?: string;
    filas?: number;
};

function CampoAreaTexto({ etiqueta, nombre, valor, alCambiar, error, placeholder, filas }: Props) {
    return (
        <div className="mb-3">
            <label htmlFor={nombre} className="form-label">
                {etiqueta}
            </label>
            <AreaTexto
                nombre={nombre}
                valor={valor}
                alCambiar={alCambiar}
                placeholder={placeholder}
                filas={filas}
                invalido={Boolean(error)}
            />
            <MensajeError id={nombre + "-error"} texto={error} />
        </div>
    );
}
export default CampoAreaTexto;
