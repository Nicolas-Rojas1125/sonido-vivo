import type { ReactNode } from "react";
import { formatearPrecio } from "../../utilidades/formato";

type Props = {
    unidades: number;
    subtotal: number;
    costoEnvio?: number; // undefined = todavía no se elige la entrega
    children?: ReactNode; // botón de acción (continuar, confirmar, etc.)
};

function ResumenCompra({ unidades, subtotal, costoEnvio, children }: Props) {
    const total = subtotal + (costoEnvio ?? 0);

    return (
        <aside className="card resumen-compra" aria-label="Resumen de la compra">
            <div className="card-body">
                <h2 className="h5 mb-3">Resumen</h2>
                <dl className="row mb-0">
                    <dt className="col-7 fw-normal">Productos ({unidades})</dt>
                    <dd className="col-5 text-end">{formatearPrecio(subtotal)}</dd>
                    <dt className="col-7 fw-normal">Envío</dt>
                    <dd className="col-5 text-end">
                        {costoEnvio === undefined ? "Por calcular" : costoEnvio === 0 ? "Gratis" : formatearPrecio(costoEnvio)}
                    </dd>
                    <dt className="col-7 border-top pt-2">Total</dt>
                    <dd className="col-5 text-end border-top pt-2 fw-bold fs-5" data-testid="total">
                        {formatearPrecio(total)}
                    </dd>
                </dl>
                {children && <div className="mt-3">{children}</div>}
            </div>
        </aside>
    );
}
export default ResumenCompra;
