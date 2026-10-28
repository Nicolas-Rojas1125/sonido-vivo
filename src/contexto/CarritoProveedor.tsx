import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { almacenamiento, CLAVES } from "../servicios/almacenamiento";
import { productosServicio } from "../servicios/productosServicio";
import type { ItemCarrito } from "../tipos/Pedido";
import {
    agregarAlCarrito,
    calcularSubtotal,
    cambiarCantidad,
    contarUnidades,
    quitarDelCarrito,
} from "../utilidades/carrito";
import { CarritoContexto } from "./CarritoContexto";
import type { ValorCarrito } from "./CarritoContexto";

type Props = {
    children: ReactNode;
};

function CarritoProveedor({ children }: Props) {
    // Al cargar, el carrito guardado se sincroniza con el catálogo actual:
    // se actualizan precio y stock, y se quitan productos eliminados o agotados.
    const [items, setItems] = useState<ItemCarrito[]>(() =>
        almacenamiento.leer<ItemCarrito[]>(CLAVES.carrito, []).flatMap((item) => {
            const producto = productosServicio.obtenerPorCodigo(item.codigo);
            if (!producto || producto.stock <= 0) {
                return [];
            }
            return [
                {
                    ...item,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    stock: producto.stock,
                    cantidad: Math.min(item.cantidad, producto.stock),
                },
            ];
        })
    );

    // Cada vez que cambia el carrito, se guarda en el navegador (no se pierde al recargar)
    useEffect(() => {
        almacenamiento.guardar(CLAVES.carrito, items);
    }, [items]);

    const valor: ValorCarrito = {
        items,
        unidades: contarUnidades(items),
        subtotal: calcularSubtotal(items),
        agregar: (producto, cantidad = 1) => setItems((actuales) => agregarAlCarrito(actuales, producto, cantidad)),
        cambiarCantidad: (codigo, cantidad) => setItems((actuales) => cambiarCantidad(actuales, codigo, cantidad)),
        quitar: (codigo) => setItems((actuales) => quitarDelCarrito(actuales, codigo)),
        vaciar: () => setItems([]),
    };

    return <CarritoContexto.Provider value={valor}>{children}</CarritoContexto.Provider>;
}
export default CarritoProveedor;
