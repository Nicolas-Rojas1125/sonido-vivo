import type { Pedido } from "../tipos/Pedido";

// Pedidos de ejemplo para que el panel de administración no parta vacío
export const pedidosIniciales: Pedido[] = [
    {
        id: 1,
        numero: "SV-0001",
        fecha: "2026-10-05T11:20:00",
        clienteCorreo: "cliente@correo.cl",
        clienteNombre: "Cliente de Prueba",
        telefono: "+56 9 1111 2222",
        items: [
            { codigo: "AC001", nombre: "Cuerdas Guitarra Eléctrica 09-42", precio: 8990, cantidad: 2 },
            { codigo: "AC006", nombre: "Afinador de Clip", precio: 8990, cantidad: 1 },
        ],
        tipoEntrega: "despacho",
        direccion: "Calle Los Aromos 123",
        comuna: "Concepción",
        puntoRetiro: "",
        medioPago: "webpay",
        subtotal: 26970,
        costoEnvio: 5990,
        total: 32960,
        estado: "entregado",
        seguimiento: "STK-4455123",
    },
    {
        id: 2,
        numero: "SV-0002",
        fecha: "2026-10-18T17:45:00",
        clienteCorreo: "cliente@correo.cl",
        clienteNombre: "Cliente de Prueba",
        telefono: "+56 9 1111 2222",
        items: [{ codigo: "PE001", nombre: "Pedal Distorsión", precio: 79990, cantidad: 1 }],
        tipoEntrega: "retiro",
        direccion: "",
        comuna: "",
        puntoRetiro: "tienda",
        medioPago: "transferencia",
        subtotal: 79990,
        costoEnvio: 0,
        total: 79990,
        estado: "despachado",
        seguimiento: "",
    },
    {
        id: 3,
        numero: "SV-0003",
        fecha: "2026-10-25T09:10:00",
        clienteCorreo: "maria.perez@correo.cl",
        clienteNombre: "María Pérez",
        telefono: "+56 9 3333 4444",
        items: [{ codigo: "MI001", nombre: "Micrófono Dinámico Cardioide", precio: 149990, cantidad: 1 }],
        tipoEntrega: "despacho",
        direccion: "Av. Alemania 456",
        comuna: "Temuco",
        puntoRetiro: "",
        medioPago: "webpay",
        subtotal: 149990,
        costoEnvio: 5990,
        total: 155980,
        estado: "preparacion",
        seguimiento: "",
    },
];

export const etiquetasEstadoPedido: Record<Pedido["estado"], string> = {
    preparacion: "En preparación",
    despachado: "Despachado",
    entregado: "Entregado",
};

export const colorEstadoPedido: Record<Pedido["estado"], string> = {
    preparacion: "warning",
    despachado: "info",
    entregado: "success",
};

export const ordenEstados: Pedido["estado"][] = ["preparacion", "despachado", "entregado"];
