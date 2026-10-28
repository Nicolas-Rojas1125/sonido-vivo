import { productosIniciales } from "../datos/productos";
import type { Producto } from "../tipos/Producto";
import { almacenamiento, CLAVES } from "./almacenamiento";

export interface ResultadoOperacion {
    ok: boolean;
    mensaje: string;
}

function copiarIniciales(): Producto[] {
    return productosIniciales.map((producto) => ({ ...producto }));
}

let productos: Producto[] = almacenamiento.leer<Producto[]>(CLAVES.productos, copiarIniciales());

function persistir(): void {
    almacenamiento.guardar(CLAVES.productos, productos);
}

// Servicio de productos (simula el futuro microservicio /api/productos).
// Siempre devuelve COPIAS para que ningún componente modifique los datos por accidente.
export const productosServicio = {
    obtenerTodos(): Producto[] {
        return productos.map((producto) => ({ ...producto }));
    },

    obtenerPorCodigo(codigo: string): Producto | undefined {
        const encontrado = productos.find((producto) => producto.codigo === codigo);
        return encontrado ? { ...encontrado } : undefined;
    },

    existeCodigo(codigo: string): boolean {
        return productos.some((producto) => producto.codigo === codigo);
    },

    crear(producto: Producto): ResultadoOperacion {
        if (this.existeCodigo(producto.codigo)) {
            return { ok: false, mensaje: "Ya existe un producto con el código " + producto.codigo + "." };
        }
        productos = [...productos, { ...producto }];
        persistir();
        return { ok: true, mensaje: "Producto " + producto.codigo + " creado correctamente." };
    },

    actualizar(codigo: string, datos: Producto): ResultadoOperacion {
        if (!this.existeCodigo(codigo)) {
            return { ok: false, mensaje: "El producto no existe." };
        }
        // El código no se cambia al editar (es el identificador)
        productos = productos.map((producto) => (producto.codigo === codigo ? { ...datos, codigo } : producto));
        persistir();
        return { ok: true, mensaje: "Producto " + codigo + " actualizado correctamente." };
    },

    eliminar(codigo: string): ResultadoOperacion {
        if (!this.existeCodigo(codigo)) {
            return { ok: false, mensaje: "El producto no existe." };
        }
        productos = productos.filter((producto) => producto.codigo !== codigo);
        persistir();
        return { ok: true, mensaje: "Producto " + codigo + " eliminado." };
    },

    actualizarStock(codigo: string, stock: number): ResultadoOperacion {
        if (!Number.isInteger(stock) || stock < 0) {
            return { ok: false, mensaje: "El stock debe ser un número entero mayor o igual a 0." };
        }
        if (!this.existeCodigo(codigo)) {
            return { ok: false, mensaje: "El producto no existe." };
        }
        productos = productos.map((producto) => (producto.codigo === codigo ? { ...producto, stock } : producto));
        persistir();
        return { ok: true, mensaje: "Stock de " + codigo + " actualizado a " + stock + "." };
    },

    // Descuenta el stock al confirmar un pedido. Primero revisa TODOS los productos:
    // si alguno no alcanza, no descuenta nada (evita vender lo que no hay).
    descontarStock(items: { codigo: string; cantidad: number }[]): ResultadoOperacion {
        for (const item of items) {
            const producto = productos.find((p) => p.codigo === item.codigo);
            if (!producto) {
                return { ok: false, mensaje: "El producto " + item.codigo + " ya no existe en el catálogo." };
            }
            if (producto.stock < item.cantidad) {
                return {
                    ok: false,
                    mensaje: "Stock insuficiente para " + producto.nombre + ". Disponible: " + producto.stock + ".",
                };
            }
        }

        productos = productos.map((producto) => {
            const item = items.find((i) => i.codigo === producto.codigo);
            return item ? { ...producto, stock: producto.stock - item.cantidad } : producto;
        });
        persistir();
        return { ok: true, mensaje: "Stock actualizado." };
    },

    reiniciar(): void {
        productos = copiarIniciales();
        persistir();
    },
};
