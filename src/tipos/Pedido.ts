// Estados del pedido indicados en el caso: en preparación, despachado, entregado
export type EstadoPedido = "preparacion" | "despachado" | "entregado";

export type TipoEntrega = "despacho" | "retiro";

export type MedioPago = "transferencia" | "webpay";

export interface ItemCarrito {
    codigo: string;
    nombre: string;
    marca: string;
    precio: number;
    imagen: string;
    cantidad: number;
    stock: number; // stock disponible al momento de agregarlo (límite de cantidad)
}

export interface ItemPedido {
    codigo: string;
    nombre: string;
    precio: number;
    cantidad: number;
}

export interface Pedido {
    id: number;
    numero: string; // Ej: "SV-0001"
    fecha: string; // fecha en formato ISO
    clienteCorreo: string;
    clienteNombre: string;
    telefono: string;
    items: ItemPedido[];
    tipoEntrega: TipoEntrega;
    direccion: string;
    comuna: string;
    puntoRetiro: string;
    medioPago: MedioPago;
    subtotal: number;
    costoEnvio: number;
    total: number;
    estado: EstadoPedido;
    seguimiento: string; // N° de seguimiento Starken / Chilexpress
}

export interface DatosCheckout {
    nombre: string;
    correo: string;
    telefono: string;
    tipoEntrega: string;
    direccion: string;
    comuna: string;
    puntoRetiro: string;
    medioPago: string;
}

export type ErroresCheckout = Partial<Record<keyof DatosCheckout, string>>;
