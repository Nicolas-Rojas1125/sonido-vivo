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
    sincronizarConCatalogo,
} from "../utilidades/carrito";
import { CarritoContexto } from "./CarritoContexto";
import type { ValorCarrito } from "./CarritoContexto";
import { useSesion } from "./useSesion";

type Props = {
    children: ReactNode;
};

function CarritoProveedor({ children }: Props) {
    // El carrito se guarda en el navegador (no es información sensible) para no perderlo al recargar
    const [items, setItems] = useState<ItemCarrito[]>(() => almacenamiento.leer<ItemCarrito[]>(CLAVES.carrito, []));
    const idUsuario = useSesion().usuario?.id;

    // Se sincroniza con el catálogo del backend (precios y stock actuales) al abrir la página
    // y cada vez que cambia el usuario. El catálogo es público, así que funciona también para el invitado.
    useEffect(() => {
        let vigente = true;
        productosServicio
            .listar()
            .then((catalogo) => {
                if (vigente) setItems((actuales) => sincronizarConCatalogo(actuales, catalogo));
            })
            .catch(() => {
                // Sin conexión: se mantiene el carrito tal como estaba
            });
        return () => {
            vigente = false;
        };
    }, [idUsuario]);

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
