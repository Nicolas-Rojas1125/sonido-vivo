import { productosIniciales } from "../datos/productos";
import type { ItemCarrito } from "../tipos/Pedido";
import type { Producto } from "../tipos/Producto";
import { agregarAlCarrito, calcularSubtotal, cambiarCantidad, contarUnidades, quitarDelCarrito } from "./carrito";

describe("Lógica del carrito", () => {
    // Producto de prueba con stock 3
    const guitarra: Producto = { ...productosIniciales[0], codigo: "GA001", precio: 100000, stock: 3 };
    const pua: Producto = { ...productosIniciales[0], codigo: "AC004", precio: 4000, stock: 50 };

    it("agrega un producto nuevo con la cantidad indicada", () => {
        const items = agregarAlCarrito([], guitarra, 2);
        expect(items.length).toBe(1);
        expect(items[0].codigo).toBe("GA001");
        expect(items[0].cantidad).toBe(2);
    });

    it("suma la cantidad si el producto ya estaba en el carrito", () => {
        let items = agregarAlCarrito([], pua, 2);
        items = agregarAlCarrito(items, pua, 3);
        expect(items.length).toBe(1);
        expect(items[0].cantidad).toBe(5);
    });

    it("nunca supera el stock disponible", () => {
        const items = agregarAlCarrito(agregarAlCarrito([], guitarra, 2), guitarra, 5);
        expect(items[0].cantidad).toBe(3);
    });

    it("no agrega productos agotados ni cantidades inválidas", () => {
        expect(agregarAlCarrito([], { ...guitarra, stock: 0 })).toEqual([]);
        expect(agregarAlCarrito([], guitarra, 0)).toEqual([]);
    });

    it("no modifica la lista original (inmutabilidad)", () => {
        const original: ItemCarrito[] = agregarAlCarrito([], pua, 1);
        const copia = JSON.stringify(original);
        agregarAlCarrito(original, pua, 1);
        cambiarCantidad(original, "AC004", 9);
        expect(JSON.stringify(original)).toBe(copia);
    });

    it("cambia la cantidad respetando el stock y quita el item si la cantidad es 0", () => {
        const items = agregarAlCarrito([], guitarra, 1);
        expect(cambiarCantidad(items, "GA001", 10)[0].cantidad).toBe(3);
        expect(cambiarCantidad(items, "GA001", 0)).toEqual([]);
    });

    it("calcula subtotal, unidades y permite quitar productos", () => {
        let items = agregarAlCarrito([], guitarra, 2); // 200.000
        items = agregarAlCarrito(items, pua, 3); // 12.000
        expect(calcularSubtotal(items)).toBe(212000);
        expect(contarUnidades(items)).toBe(5);
        expect(quitarDelCarrito(items, "GA001").map((i) => i.codigo)).toEqual(["AC004"]);
    });
});
