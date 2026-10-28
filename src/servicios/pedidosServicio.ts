import { pedidosIniciales } from "../datos/pedidos";
import type { EstadoPedido, ItemPedido, MedioPago, Pedido, TipoEntrega } from "../tipos/Pedido";
import { formatearNumeroPedido } from "../utilidades/formato";
import { almacenamiento, CLAVES } from "./almacenamiento";

export interface DatosNuevoPedido {
    clienteCorreo: string;
    clienteNombre: string;
    telefono: string;
    items: ItemPedido[];
    tipoEntrega: TipoEntrega;
    direccion: string;
    comuna: string;
    puntoRetiro: string;
    medioPago: MedioPago;
    costoEnvio: number;
}

export interface ResumenVentas {
    totalVentas: number;
    cantidadPedidos: number;
    porEstado: Record<EstadoPedido, number>;
}

function copiarIniciales(): Pedido[] {
    return pedidosIniciales.map((pedido) => ({ ...pedido, items: pedido.items.map((i) => ({ ...i })) }));
}

let pedidos: Pedido[] = almacenamiento.leer<Pedido[]>(CLAVES.pedidos, copiarIniciales());

function persistir(): void {
    almacenamiento.guardar(CLAVES.pedidos, pedidos);
}

function copiar(pedido: Pedido): Pedido {
    return { ...pedido, items: pedido.items.map((item) => ({ ...item })) };
}

// Servicio de pedidos (simula el futuro microservicio /api/pedidos)
export const pedidosServicio = {
    // Más recientes primero
    obtenerTodos(): Pedido[] {
        return pedidos.map(copiar).sort((a, b) => b.id - a.id);
    },

    // Un cliente solo puede ver SUS pedidos (regla del caso)
    obtenerPorCliente(correo: string): Pedido[] {
        return this.obtenerTodos().filter((pedido) => pedido.clienteCorreo === correo.toLowerCase());
    },

    crear(datos: DatosNuevoPedido): Pedido {
        const id = pedidos.reduce((max, p) => Math.max(max, p.id), 0) + 1;
        const subtotal = datos.items.reduce((total, item) => total + item.precio * item.cantidad, 0);
        const nuevo: Pedido = {
            ...datos,
            clienteCorreo: datos.clienteCorreo.toLowerCase(),
            items: datos.items.map((item) => ({ ...item })),
            id,
            numero: formatearNumeroPedido(id),
            fecha: new Date().toISOString(),
            subtotal,
            total: subtotal + datos.costoEnvio,
            estado: "preparacion",
            seguimiento: "",
        };
        pedidos = [...pedidos, nuevo];
        persistir();
        return copiar(nuevo);
    },

    actualizarEstado(id: number, estado: EstadoPedido, seguimiento = ""): Pedido | undefined {
        const existe = pedidos.some((pedido) => pedido.id === id);
        if (!existe) {
            return undefined;
        }
        pedidos = pedidos.map((pedido) =>
            pedido.id === id ? { ...pedido, estado, seguimiento: seguimiento.trim() } : pedido
        );
        persistir();
        const actualizado = pedidos.find((pedido) => pedido.id === id);
        return actualizado ? copiar(actualizado) : undefined;
    },

    obtenerResumen(): ResumenVentas {
        const porEstado: Record<EstadoPedido, number> = { preparacion: 0, despachado: 0, entregado: 0 };
        let totalVentas = 0;
        for (const pedido of pedidos) {
            porEstado[pedido.estado] += 1;
            totalVentas += pedido.total;
        }
        return { totalVentas, cantidadPedidos: pedidos.length, porEstado };
    },

    reiniciar(): void {
        pedidos = copiarIniciales();
        persistir();
    },
};
