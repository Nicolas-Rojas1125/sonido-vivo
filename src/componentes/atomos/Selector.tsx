export type Opcion = {
    valor: string;
    etiqueta: string;
};

type Props = {
    nombre: string;
    valor: string;
    opciones: Opcion[];
    alCambiar: (valor: string) => void;
    invalido?: boolean;
    textoVacio?: string; // si se omite, no se muestra la opción vacía
    etiquetaAria?: string;
};

function Selector({ nombre, valor, opciones, alCambiar, invalido = false, textoVacio, etiquetaAria }: Props) {
    return (
        <select
            id={nombre}
            name={nombre}
            className={"form-select" + (invalido ? " is-invalid" : "")}
            value={valor}
            aria-invalid={invalido}
            aria-describedby={invalido ? nombre + "-error" : undefined}
            aria-label={etiquetaAria}
            onChange={(e) => alCambiar(e.target.value)}
        >
            {textoVacio !== undefined && <option value="">{textoVacio}</option>}
            {opciones.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                </option>
            ))}
        </select>
    );
}
export default Selector;
