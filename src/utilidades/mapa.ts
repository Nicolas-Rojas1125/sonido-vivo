// Enlace de Google Maps con la ruta desde la ubicación del cliente hasta el punto indicado
export function urlComoLlegar(coordenadas: [number, number]): string {
    return "https://www.google.com/maps/dir/?api=1&destination=" + coordenadas[0] + "," + coordenadas[1];
}
