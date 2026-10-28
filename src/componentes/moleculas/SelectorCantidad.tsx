type Props = {
    cantidad: number;
    maximo: number;
    alCambiar: (cantidad: number) => void;
    etiqueta?: string;
};

// Botones − / + para elegir cuántas unidades comprar (nunca más que el stock)
function SelectorCantidad({ cantidad, maximo, alCambiar, etiqueta = "Cantidad" }: Props) {
    return (
        <div className="input-group selector-cantidad" role="group" aria-label={etiqueta}>
            <button
                type="button"
                className="btn btn-outline-secondary"
                aria-label="Disminuir cantidad"
                disabled={cantidad <= 1}
                onClick={() => alCambiar(cantidad - 1)}
            >
                −
            </button>
            <span className="form-control text-center" aria-live="polite" data-testid="cantidad">
                {cantidad}
            </span>
            <button
                type="button"
                className="btn btn-outline-secondary"
                aria-label="Aumentar cantidad"
                disabled={cantidad >= maximo}
                onClick={() => alCambiar(cantidad + 1)}
            >
                +
            </button>
        </div>
    );
}
export default SelectorCantidad;
