type Props = {
    texto: string;
    tipo?: "success" | "danger" | "warning" | "info";
    alCerrar?: () => void;
};

// Mensaje de confirmación o error (alert de Bootstrap). Si el texto está vacío no se muestra.
function Alerta({ texto, tipo = "success", alCerrar }: Props) {
    if (texto === "") {
        return null;
    }
    return (
        <div className={"alert alert-" + tipo + " d-flex justify-content-between align-items-start"} role="status">
            <span>{texto}</span>
            {alCerrar && <button type="button" className="btn-close ms-3" aria-label="Cerrar mensaje" onClick={alCerrar} />}
        </div>
    );
}
export default Alerta;
