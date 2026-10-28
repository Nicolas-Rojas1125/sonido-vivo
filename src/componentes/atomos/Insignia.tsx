type Props = {
    texto: string;
    color?: string; // color de Bootstrap: success, warning, info, secondary, danger...
};

// Etiqueta pequeña de color (badge de Bootstrap). Ej: estado del stock o del pedido
function Insignia({ texto, color = "secondary" }: Props) {
    return <span className={"badge text-bg-" + color}>{texto}</span>;
}
export default Insignia;
