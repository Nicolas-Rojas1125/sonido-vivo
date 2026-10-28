type Props = {
    titulo: string;
    valor: string;
    detalle?: string;
    color?: "marca" | "success" | "warning" | "info";
};

// Tarjeta de indicador para el panel de administración
function TarjetaResumen({ titulo, valor, detalle, color = "marca" }: Props) {
    return (
        <div className={"card h-100 tarjeta-resumen borde-" + color}>
            <div className="card-body">
                <p className="text-body-secondary small text-uppercase mb-1">{titulo}</p>
                <p className="h3 fw-bold mb-1">{valor}</p>
                {detalle && <p className="small text-body-secondary mb-0">{detalle}</p>}
            </div>
        </div>
    );
}
export default TarjetaResumen;
