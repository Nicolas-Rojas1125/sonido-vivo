type Props = {
    tipo: string;
    nombre: string;
    valor: string;
    alCambiar: (valor: string) => void;
    placeholder?: string;
    invalido?: boolean;
    min?: number;
    max?: number;
    autoComplete?: string;
    etiquetaAria?: string;
};

function Input({ tipo, nombre, valor, alCambiar, placeholder, invalido = false, min, max, autoComplete, etiquetaAria }: Props) {
    return (
        <input
            type={tipo}
            id={nombre}
            name={nombre}
            className={"form-control" + (invalido ? " is-invalid" : "")}
            placeholder={placeholder}
            value={valor}
            min={min}
            max={max}
            autoComplete={autoComplete}
            aria-invalid={invalido}
            aria-describedby={invalido ? nombre + "-error" : undefined}
            aria-label={etiquetaAria}
            onChange={(e) => alCambiar(e.target.value)}
        />
    );
}
export default Input;
