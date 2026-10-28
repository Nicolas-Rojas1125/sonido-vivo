export type VarianteBoton =
    | "marca"
    | "outline-marca"
    | "oscuro"
    | "outline-secondary"
    | "success"
    | "danger"
    | "warning"
    | "filtro";

type Props = {
    texto: string;
    tipo?: "button" | "submit";
    variante?: VarianteBoton;
    tamano?: "sm" | "lg";
    activo?: boolean;
    deshabilitado?: boolean;
    anchoCompleto?: boolean;
    etiquetaAria?: string;
    alClick?: () => void;
};

function Boton({
    texto,
    tipo = "button",
    variante = "marca",
    tamano,
    activo = false,
    deshabilitado = false,
    anchoCompleto = false,
    etiquetaAria,
    alClick,
}: Props) {
    const clases = ["btn", "btn-" + variante];
    if (tamano) clases.push("btn-" + tamano);
    if (activo) clases.push("active");
    if (anchoCompleto) clases.push("w-100");

    return (
        <button
            type={tipo}
            className={clases.join(" ")}
            disabled={deshabilitado}
            aria-pressed={variante === "filtro" ? activo : undefined}
            aria-label={etiquetaAria}
            onClick={alClick}
        >
            {texto}
        </button>
    );
}
export default Boton;
