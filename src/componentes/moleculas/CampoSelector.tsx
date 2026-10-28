import MensajeError from "../atomos/MensajeError";
import Selector from "../atomos/Selector";
import type { Opcion } from "../atomos/Selector";

type Props = {
    etiqueta: string;
    nombre: string;
    valor: string;
    opciones: Opcion[];
    alCambiar: (valor: string) => void;
    error?: string;
    textoVacio?: string;
};

function CampoSelector({ etiqueta, nombre, valor, opciones, alCambiar, error, textoVacio = "Selecciona una opción" }: Props) {
    return (
        <div className="mb-3">
            <label htmlFor={nombre} className="form-label">
                {etiqueta}
            </label>
            <Selector
                nombre={nombre}
                valor={valor}
                opciones={opciones}
                alCambiar={alCambiar}
                textoVacio={textoVacio}
                invalido={Boolean(error)}
            />
            <MensajeError id={nombre + "-error"} texto={error} />
        </div>
    );
}
export default CampoSelector;
