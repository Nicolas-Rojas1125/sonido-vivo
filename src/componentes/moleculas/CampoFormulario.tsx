import Input from "../atomos/Input";
import MensajeError from "../atomos/MensajeError";

type Props = {
    etiqueta: string;
    tipo: string;
    nombre: string;
    valor: string;
    alCambiar: (valor: string) => void;
    error?: string;
    placeholder?: string;
    ayuda?: string;
    autoComplete?: string;
};

// Molécula = átomos juntos: etiqueta + input + mensaje de error
function CampoFormulario({ etiqueta, tipo, nombre, valor, alCambiar, error, placeholder, ayuda, autoComplete }: Props) {
    return (
        <div className="mb-3">
            <label htmlFor={nombre} className="form-label">
                {etiqueta}
            </label>
            <Input
                tipo={tipo}
                nombre={nombre}
                valor={valor}
                alCambiar={alCambiar}
                placeholder={placeholder}
                autoComplete={autoComplete}
                invalido={Boolean(error)}
            />
            {ayuda && !error && <div className="form-text">{ayuda}</div>}
            <MensajeError id={nombre + "-error"} texto={error} />
        </div>
    );
}
export default CampoFormulario;
