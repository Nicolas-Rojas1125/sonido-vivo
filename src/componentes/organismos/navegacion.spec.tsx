import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { imagenesCarrusel } from "../../datos/inicio";
import { iniciarSesionComo, prepararCarrito, reiniciarDatos, renderizarConProveedores } from "../../test/utilidades";
import Carrusel from "./Carrusel";
import Navbar from "./Navbar";
import ResumenCompra from "./ResumenCompra";
import RutaProtegida from "./RutaProtegida";

describe("Organismo Navbar", () => {
    beforeEach(() => reiniciarDatos());

    it("abre y cierra el menú hamburguesa (estado 'abierto')", () => {
        renderizarConProveedores(<Navbar />);
        const boton = screen.getByRole("button", { name: "Abrir menú de navegación" });
        const menu = document.getElementById("menuPrincipal")!;
        expect(menu.classList).not.toContain("show");
        fireEvent.click(boton);
        expect(menu.classList).toContain("show");
        expect(boton.getAttribute("aria-expanded")).toBe("true");
    });

    it("muestra la cantidad de productos del carrito", () => {
        iniciarSesionComo("cliente");
        prepararCarrito([{ codigo: "AC004", nombre: "Púas", marca: "Fender", precio: 3990, imagen: "", cantidad: 3, stock: 50 }]);
        renderizarConProveedores(<Navbar />);
        expect(screen.getByRole("link", { name: "Carrito de compras, 3 productos" })).toBeTruthy();
    });

    it("sin sesión muestra 'Iniciar sesión' y no muestra el Panel", () => {
        renderizarConProveedores(<Navbar />);
        expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeTruthy();
        expect(screen.queryByRole("link", { name: "Panel" })).toBeNull();
        expect(screen.queryByRole("link", { name: "Catálogo" })).toBeNull();
    });

    it("el administrador ve 'Panel' y el cliente ve 'Mis pedidos'", () => {
        iniciarSesionComo("administrador");
        const { unmount } = renderizarConProveedores(<Navbar />);
        expect(screen.getByRole("link", { name: "Panel" })).toBeTruthy();
        expect(screen.queryByRole("link", { name: "Mis pedidos" })).toBeNull();
        unmount();

        iniciarSesionComo("cliente");
        renderizarConProveedores(<Navbar />);
        expect(screen.getByRole("link", { name: "Mis pedidos" })).toBeTruthy();
        expect(screen.getByText("Hola, Cliente")).toBeTruthy();
    });

    it("'Cerrar sesión' borra la sesión", () => {
        iniciarSesionComo("cliente");
        renderizarConProveedores(<Navbar />);
        fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
        expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeTruthy();
        expect(window.localStorage.getItem("sv_sesion")).toBeNull();
    });
});

describe("Organismo RutaProtegida", () => {
    beforeEach(() => reiniciarDatos());

    const renderizar = () =>
        renderizarConProveedores(
            <Routes>
                <Route path="/login" element={<p>Página de login</p>} />
                <Route path="/secreto" element={<RutaProtegida roles={["administrador"]}><p>Contenido privado</p></RutaProtegida>} />
            </Routes>,
            "/secreto"
        );

    it("sin sesión redirige al login", () => {
        renderizar();
        expect(screen.getByText("Página de login")).toBeTruthy();
        expect(screen.queryByText("Contenido privado")).toBeNull();
    });

    it("con un rol sin permiso muestra 'Acceso denegado'", () => {
        iniciarSesionComo("cliente");
        renderizar();
        expect(screen.getByText("Acceso denegado")).toBeTruthy();
    });

    it("con el rol correcto muestra el contenido", () => {
        iniciarSesionComo("administrador");
        renderizar();
        expect(screen.getByText("Contenido privado")).toBeTruthy();
    });
});

describe("Organismo Carrusel", () => {
    it("avanza, retrocede (circular) y salta con los indicadores", () => {
        render(
            <MemoryRouter>
                <Carrusel imagenes={imagenesCarrusel} />
            </MemoryRouter>
        );
        const titulo = () => screen.getByRole("heading").textContent;
        expect(titulo()).toBe(imagenesCarrusel[0].titulo);
        fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
        expect(titulo()).toBe(imagenesCarrusel[1].titulo);
        fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
        fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
        expect(titulo()).toBe(imagenesCarrusel[2].titulo);
        fireEvent.click(screen.getByRole("button", { name: "Ir a la imagen 1" }));
        expect(titulo()).toBe(imagenesCarrusel[0].titulo);
    });

    it("avanza solo cada 5 segundos y se pausa con el mouse encima (mock del reloj)", () => {
        jasmine.clock().install();
        try {
            const { container } = render(
                <MemoryRouter>
                    <Carrusel imagenes={imagenesCarrusel} />
                </MemoryRouter>
            );
            const titulo = () => screen.getByRole("heading").textContent;
            act(() => jasmine.clock().tick(5000));
            expect(titulo()).toBe(imagenesCarrusel[1].titulo);

            fireEvent.mouseEnter(container.querySelector(".carrusel-inicio")!);
            act(() => jasmine.clock().tick(10000));
            expect(titulo()).toBe(imagenesCarrusel[1].titulo); // pausado: no cambió

            fireEvent.mouseLeave(container.querySelector(".carrusel-inicio")!);
            act(() => jasmine.clock().tick(5000));
            expect(titulo()).toBe(imagenesCarrusel[2].titulo);
        } finally {
            jasmine.clock().uninstall();
        }
    });

    it("no muestra nada si no hay imágenes", () => {
        const { container } = render(<Carrusel imagenes={[]} />);
        expect(container.innerHTML).toBe("");
    });
});

describe("Organismo ResumenCompra", () => {
    it("calcula el total sumando el envío y muestra 'Gratis' si el envío es 0", () => {
        const { rerender } = render(<ResumenCompra unidades={2} subtotal={100000} costoEnvio={5990} />);
        expect(screen.getByTestId("total").textContent).toBe("$105.990");
        rerender(<ResumenCompra unidades={2} subtotal={100000} costoEnvio={0} />);
        expect(screen.getByText("Gratis")).toBeTruthy();
        rerender(<ResumenCompra unidades={2} subtotal={100000} />);
        expect(screen.getByText("Por calcular")).toBeTruthy();
    });
});
