// Formatea un número como precio chileno: 129990 -> "$129.990"
export function formatearPrecio(precio: number): string {
    const entero = Math.round(precio);
    const signo = entero < 0 ? "-" : "";
    return signo + "$" + String(Math.abs(entero)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Formatea una fecha ISO como "27-10-2026 16:59"
export function formatearFecha(fechaIso: string): string {
    const fecha = new Date(fechaIso);
    if (Number.isNaN(fecha.getTime())) {
        return "";
    }
    const dos = (n: number) => String(n).padStart(2, "0");
    return (
        dos(fecha.getDate()) +
        "-" +
        dos(fecha.getMonth() + 1) +
        "-" +
        fecha.getFullYear() +
        " " +
        dos(fecha.getHours()) +
        ":" +
        dos(fecha.getMinutes())
    );
}

// Genera el número visible del pedido: 7 -> "SV-0007"
export function formatearNumeroPedido(id: number): string {
    return "SV-" + String(id).padStart(4, "0");
}
