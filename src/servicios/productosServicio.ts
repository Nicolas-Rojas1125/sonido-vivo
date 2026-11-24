// Servicio de productos: se comunica con ms-tienda (/api/productos).
// Todas las peticiones llevan el token (el catálogo exige sesión iniciada).
import type { Producto } from "../tipos/Producto";
import { api, ErrorApi, mensajeDeError, URL_TIENDA } from "./api";

export interface ResultadoOperacion {
    ok: boolean;
    mensaje: string;
}

const URL = URL_TIENDA + "/productos";

// Convierte una operación (crear, editar, eliminar...) en { ok, mensaje } para mostrar en una Alerta
async function operacion(accion: () => Promise<unknown>, mensajeOk: string): Promise<ResultadoOperacion> {
    try {
        await accion();
        return { ok: true, mensaje: mensajeOk };
    } catch (error) {
        return { ok: false, mensaje: mensajeDeError(error) };
    }
}

export const productosServicio = {
    // GET /api/productos
    listar(): Promise<Producto[]> {
        return api.get<Producto[]>(URL);
    },

    // GET /api/productos/{codigo}. Devuelve null si no existe (404).
    async obtener(codigo: string): Promise<Producto | null> {
        try {
            return await api.get<Producto>(URL + "/" + encodeURIComponent(codigo));
        } catch (error) {
            if (error instanceof ErrorApi && error.estado === 404) {
                return null;
            }
            throw error;
        }
    },

    // POST /api/productos (solo Administrador)
    crear(producto: Producto): Promise<ResultadoOperacion> {
        return operacion(() => api.post(URL, producto), "Producto " + producto.codigo + " creado correctamente.");
    },

    // PUT /api/productos/{codigo} (solo Administrador). El código no se cambia.
    actualizar(codigo: string, producto: Producto): Promise<ResultadoOperacion> {
        return operacion(() => api.put(URL + "/" + codigo, { ...producto, codigo }), "Producto " + codigo + " actualizado correctamente.");
    },

    // DELETE /api/productos/{codigo} (solo Administrador)
    eliminar(codigo: string): Promise<ResultadoOperacion> {
        return operacion(() => api.delete(URL + "/" + codigo), "Producto " + codigo + " eliminado.");
    },

    // PATCH /api/productos/{codigo}/stock (Administrador y Vendedor)
    actualizarStock(codigo: string, stock: number): Promise<ResultadoOperacion> {
        if (!Number.isInteger(stock) || stock < 0) {
            return Promise.resolve({ ok: false, mensaje: "El stock debe ser un número entero mayor o igual a 0." });
        }
        return operacion(() => api.patch(URL + "/" + codigo + "/stock", { stock }), "Stock de " + codigo + " actualizado a " + stock + ".");
    },
};
