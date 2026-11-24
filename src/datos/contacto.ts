// Opciones del selector "Asunto" del formulario de contacto.
// El valor es lo que se guarda en la base de datos (columna asunto); la etiqueta es lo que ve el usuario.
export const asuntosContacto = [
    { valor: "stock", etiqueta: "Consulta de stock o precio" },
    { valor: "pedido", etiqueta: "Estado de mi pedido" },
    { valor: "reparacion", etiqueta: "Reparación de instrumento" },
    { valor: "otro", etiqueta: "Otro" },
];

export function etiquetaAsunto(valor: string): string {
    return asuntosContacto.find((asunto) => asunto.valor === valor)?.etiqueta ?? valor;
}
