// Servicio de pedidos: se comunica con ms-tienda (/api/pedidos).
import type { EstadoPedido, MedioPago, Pedido, TipoEntrega } from "../tipos/Pedido";
import { api, URL_TIENDA } from "./api";

// Lo que envía el checkout. NO incluye precios ni el correo del cliente:
// el backend usa los precios de la base de datos y el correo del token (no se pueden falsificar).
export interface DatosNuevoPedido {
    clienteNombre: string;
    telefono: string;
    items: { codigo: string; cantidad: number }[];
    tipoEntrega: TipoEntrega;
    direccion: string;
    comuna: string;
    puntoRetiro: string;
    medioPago: MedioPago;
}

export interface ResumenVentas {
    totalVentas: number;
    cantidadPedidos: number;
    porEstado: Record<EstadoPedido, number>;
}

const URL = URL_TIENDA + "/pedidos";

export const pedidosServicio = {
    // POST /api/pedidos (Cliente). Si no hay stock suficiente el backend responde 409 y se lanza un ErrorApi.
    crear(datos: DatosNuevoPedido): Promise<Pedido> {
        return api.post<Pedido>(URL, datos);
    },

    // GET /api/pedidos/mios (Cliente): solo los pedidos del usuario del token
    misPedidos(): Promise<Pedido[]> {
        return api.get<Pedido[]>(URL + "/mios");
    },

    // GET /api/pedidos (Administrador y Vendedor)
    listarTodos(): Promise<Pedido[]> {
        return api.get<Pedido[]>(URL);
    },

    // PUT /api/pedidos/{id}/estado (Administrador y Vendedor)
    actualizarEstado(id: number, estado: EstadoPedido, seguimiento = ""): Promise<Pedido> {
        return api.put<Pedido>(URL + "/" + id + "/estado", { estado, seguimiento: seguimiento.trim() });
    },

    // GET /api/pedidos/resumen (Administrador y Vendedor)
    obtenerResumen(): Promise<ResumenVentas> {
        return api.get<ResumenVentas>(URL + "/resumen");
    },
};
