type Props = {
    nombre: string;
    valor: string;
    alCambiar: (valor: string) => void;
    filas?: number;
    placeholder?: string;
    invalido?: boolean;
};

function AreaTexto({ nombre, valor, alCambiar, filas = 4, placeholder, invalido = false }: Props) {
    return (
        <textarea
            id={nombre}
            name={nombre}
            rows={filas}
            className={"form-control" + (invalido ? " is-invalid" : "")}
            placeholder={placeholder}
            value={valor}
            aria-invalid={invalido}
            aria-describedby={invalido ? nombre + "-error" : undefined}
            onChange={(e) => alCambiar(e.target.value)}
        />
    );
}
export default AreaTexto;
