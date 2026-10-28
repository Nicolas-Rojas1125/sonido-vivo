import { productosIniciales } from "../datos/productos";
import { filtrarProductos, ordenarProductos } from "./filtros";
import { formatearFecha, formatearNumeroPedido, formatearPrecio } from "./formato";
import { urlComoLlegar } from "./mapa";
import { obtenerEstadoStock } from "./stock";

describe("Formato", () => {
    it("formatea precios en pesos chilenos con punto de miles", () => {
        expect(formatearPrecio(129990)).toBe("$129.990");
        expect(formatearPrecio(1000000)).toBe("$1.000.000");
        expect(formatearPrecio(0)).toBe("$0");
        expect(formatearPrecio(-5990)).toBe("-$5.990");
    });

    it("formatea fechas como dd-mm-aaaa hh:mm y devuelve vacío si la fecha es inválida", () => {
        expect(formatearFecha("2026-10-05T11:20:00")).toBe("05-10-2026 11:20");
        expect(formatearFecha("no es fecha")).toBe("");
    });

    it("genera el número de pedido con 4 dígitos", () => {
        expect(formatearNumeroPedido(7)).toBe("SV-0007");
    });

    it("arma el enlace 'Cómo llegar' de Google Maps", () => {
        expect(urlComoLlegar([-33, -71.5])).toContain("destination=-33,-71.5");
    });
});

describe("Filtros del catálogo", () => {
    it("filtra por categoría", () => {
        const pedales = filtrarProductos(productosIniciales, "pedales", "");
        expect(pedales.length).toBe(6);
        expect(pedales.every((p) => p.categoria === "pedales")).toBeTrue();
    });

    it("busca por nombre, marca, modelo o código sin importar mayúsculas", () => {
        expect(filtrarProductos(productosIniciales, "todos", "sm58").map((p) => p.codigo)).toEqual(["MI001"]);
        expect(filtrarProductos(productosIniciales, "todos", "ZILDJIAN").length).toBe(2);
        expect(filtrarProductos(productosIniciales, "bajos", "yamaha").map((p) => p.codigo)).toEqual(["BA003"]);
    });

    it("ordena por precio y por nombre sin modificar el arreglo original", () => {
        const primeros = productosIniciales.slice(0, 5);
        const asc = ordenarProductos(primeros, "precio-asc").map((p) => p.precio);
        expect(asc).toEqual([...asc].sort((a, b) => a - b));
        const desc = ordenarProductos(primeros, "precio-desc");
        expect(desc[0].precio).toBe(Math.max(...primeros.map((p) => p.precio)));
        expect(ordenarProductos(primeros, "nombre")[0].nombre).toBe("Guitarra 3/4 Niños");
        expect(primeros[0].codigo).toBe("GA001");
    });
});

describe("Estado del stock", () => {
    it("clasifica el stock en disponible, últimas unidades o agotado", () => {
        expect(obtenerEstadoStock(0)).toBe("agotado");
        expect(obtenerEstadoStock(2)).toBe("pocas");
        expect(obtenerEstadoStock(10)).toBe("disponible");
    });
});
