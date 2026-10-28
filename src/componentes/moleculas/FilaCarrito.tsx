import type { ItemCarrito } from "../../tipos/Pedido";
import { formatearPrecio } from "../../utilidades/formato";
import ImagenProducto from "../atomos/ImagenProducto";
import SelectorCantidad from "./SelectorCantidad";

type Props = {
    item: ItemCarrito;
    alCambiarCantidad: (codigo: string, cantidad: number) => void;
    alQuitar: (codigo: string) => void;
};

function FilaCarrito({ item, alCambiarCantidad, alQuitar }: Props) {
    return (
        <li className="list-group-item py-3">
            <div className="row g-3 align-items-center">
                <div className="col-3 col-md-2">
                    <ImagenProducto src={item.imagen} alt={item.nombre} clase="img-fluid rounded miniatura" />
                </div>
                <div className="col-9 col-md-4">
                    <h3 className="h6 mb-1">{item.nombre}</h3>
                    <small className="text-body-secondary">
                        {item.marca} · {formatearPrecio(item.precio)} c/u
                    </small>
                </div>
                <div className="col-7 col-md-3">
                    <SelectorCantidad
                        cantidad={item.cantidad}
                        maximo={item.stock}
                        etiqueta={"Cantidad de " + item.nombre}
                        alCambiar={(cantidad) => alCambiarCantidad(item.codigo, cantidad)}
                    />
                </div>
                <div className="col-5 col-md-3 text-end">
                    <p className="fw-bold mb-1">{formatearPrecio(item.precio * item.cantidad)}</p>
                    <button
                        type="button"
                        className="btn btn-link btn-sm text-danger p-0"
                        aria-label={"Quitar " + item.nombre + " del carrito"}
                        onClick={() => alQuitar(item.codigo)}
                    >
                        Quitar
                    </button>
                </div>
            </div>
        </li>
    );
}
export default FilaCarrito;
