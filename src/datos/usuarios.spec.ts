import { destinoTrasLogin, puedeAcceder } from "./usuarios";

describe("Reglas de acceso por rol", () => {
    it("el panel es para administrador y vendedor; productos y usuarios solo para el administrador", () => {
        expect(puedeAcceder("/admin", "vendedor")).toBeTrue();
        expect(puedeAcceder("/admin/pedidos", "vendedor")).toBeTrue();
        expect(puedeAcceder("/admin/usuarios", "vendedor")).toBeFalse();
        expect(puedeAcceder("/admin/productos", "administrador")).toBeTrue();
        expect(puedeAcceder("/admin", "cliente")).toBeFalse();
    });

    it("checkout y mis pedidos son solo para clientes; la tienda es para todos", () => {
        expect(puedeAcceder("/checkout", "cliente")).toBeTrue();
        expect(puedeAcceder("/mis-pedidos", "administrador")).toBeFalse();
        expect(puedeAcceder("/productos?categoria=bajos", "vendedor")).toBeTrue();
    });

    it("después del login vuelve a la página pedida solo si el rol puede verla", () => {
        expect(destinoTrasLogin("/productos/GA001", "cliente")).toBe("/productos/GA001");
        expect(destinoTrasLogin("/checkout", "vendedor")).toBe("/admin/pedidos");
        expect(destinoTrasLogin(undefined, "administrador")).toBe("/admin");
        expect(destinoTrasLogin("/", "cliente")).toBe("/");
    });
});
