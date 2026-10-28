import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { productosIniciales } from "../../datos/productos";
import type { Pedido } from "../../tipos/Pedido";
import CampoFormulario from "./CampoFormulario";
import CardProducto from "./CardProducto";
import FilaInventario from "./FilaInventario";
import FilaPedido from "./FilaPedido";
import FilaUsuario from "./FilaUsuario";
import FiltroCategorias from "./FiltroCategorias";
import SeguimientoPedido from "./SeguimientoPedido";
import SelectorCantidad from "./SelectorCantidad";

const guitarra = productosIniciales.find((p) => p.codigo === "GE001")!;

describe("Molécula CampoFormulario", () => {
    it("asocia la etiqueta con el input y muestra el error recibido por props", () => {
        render(<CampoFormulario etiqueta="Nombre" tipo="text" nombre="nombre" valor="" alCambiar={() => {}} error="Ingresa tu nombre" />);
        const input = screen.getByLabelText("Nombre");
        expect(input.classList).toContain("is-invalid");
        expect(screen.getByText("Ingresa tu nombre")).toBeTruthy();
    });

    it("muestra el texto de ayuda solo cuando no hay error", () => {
        render(<CampoFormulario etiqueta="Clave" tipo="password" nombre="clave" valor="" alCambiar={() => {}} ayuda="Mínimo 8 caracteres" />);
        expect(screen.getByText("Mínimo 8 caracteres")).toBeTruthy();
    });
});

describe("Molécula SelectorCantidad", () => {
    it("aumenta y disminuye llamando a alCambiar con el nuevo valor", () => {
        const alCambiar = jasmine.createSpy("alCambiar");
        render(<SelectorCantidad cantidad={2} maximo={5} alCambiar={alCambiar} />);
        fireEvent.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
        fireEvent.click(screen.getByRole("button", { name: "Disminuir cantidad" }));
        expect(alCambiar.calls.allArgs()).toEqual([[3], [1]]);
    });

    it("bloquea '−' en 1 y '+' cuando llega al stock máximo", () => {
        render(<SelectorCantidad cantidad={1} maximo={1} alCambiar={() => {}} />);
        expect((screen.getByRole("button", { name: "Disminuir cantidad" }) as HTMLButtonElement).disabled).toBeTrue();
        expect((screen.getByRole("button", { name: "Aumentar cantidad" }) as HTMLButtonElement).disabled).toBeTrue();
    });
});

describe("Molécula CardProducto", () => {
    const renderizar = (stock: number, alAgregar = jasmine.createSpy("alAgregar")) => {
        render(
            <MemoryRouter>
                <CardProducto producto={{ ...guitarra, stock }} alAgregar={alAgregar} />
            </MemoryRouter>
        );
        return alAgregar;
    };

    it("muestra nombre, marca, precio formateado y enlace al detalle", () => {
        renderizar(5);
        expect(screen.getByText("Guitarra Eléctrica Stratocaster")).toBeTruthy();
        expect(screen.getByText("Squier")).toBeTruthy();
        expect(screen.getByText("$249.990")).toBeTruthy();
        expect(screen.getByText("Disponible")).toBeTruthy();
        expect(screen.getByRole("link", { name: "Guitarra Eléctrica Stratocaster" }).getAttribute("href")).toBe("/productos/GE001");
    });

    it("al presionar 'Agregar al carrito' envía el producto al padre", () => {
        const alAgregar = renderizar(5);
        fireEvent.click(screen.getByRole("button", { name: /Agregar Guitarra Eléctrica Stratocaster/ }));
        expect(alAgregar).toHaveBeenCalledWith(jasmine.objectContaining({ codigo: "GE001" }));
    });

    it("si está agotado muestra 'Sin stock' y deshabilita el botón", () => {
        renderizar(0);
        expect(screen.getByText("Agotado")).toBeTruthy();
        expect((screen.getByRole("button", { name: /Agregar/ }) as HTMLButtonElement).disabled).toBeTrue();
    });
});

describe("Molécula FiltroCategorias", () => {
    it("marca la categoría activa y avisa la categoría seleccionada", () => {
        const alSeleccionar = jasmine.createSpy("alSeleccionar");
        render(<FiltroCategorias categoriaActiva="bajos" alSeleccionar={alSeleccionar} />);
        expect(screen.getAllByRole("button").length).toBe(11); // "Todos" + 10 categorías
        expect(screen.getByRole("button", { name: "Bajos" }).getAttribute("aria-pressed")).toBe("true");
        fireEvent.click(screen.getByRole("button", { name: "Pedales" }));
        expect(alSeleccionar).toHaveBeenCalledWith("pedales");
    });
});

describe("Molécula SeguimientoPedido", () => {
    it("marca como completados los pasos hasta el estado actual", () => {
        const { container } = render(<SeguimientoPedido estado="despachado" />);
        const pasos = within(container).getAllByRole("listitem");
        expect(pasos.map((p) => p.classList.contains("completado"))).toEqual([true, true, false]);
        expect(pasos[1].getAttribute("aria-current")).toBe("step");
    });
});

describe("Moléculas de las tablas del panel", () => {
    const enTabla = (fila: ReactNode) =>
        render(
            <table>
                <tbody>{fila}</tbody>
            </table>
        );

    it("FilaInventario habilita 'Guardar' solo si el stock cambió y es válido", () => {
        const alGuardar = jasmine.createSpy("alGuardar");
        enTabla(<FilaInventario producto={{ ...guitarra, stock: 5 }} alGuardar={alGuardar} />);
        const guardar = screen.getByRole("button", { name: /Guardar stock/ }) as HTMLButtonElement;
        expect(guardar.disabled).toBeTrue();

        fireEvent.change(screen.getByLabelText(/Stock de/), { target: { value: "12" } });
        expect(guardar.disabled).toBeFalse();
        fireEvent.click(guardar);
        expect(alGuardar).toHaveBeenCalledWith("GE001", 12);
    });

    it("FilaPedido envía el nuevo estado y el número de seguimiento", () => {
        const pedido: Pedido = {
            id: 9, numero: "SV-0009", fecha: "2026-10-01T10:00:00", clienteCorreo: "a@a.cl", clienteNombre: "Ana",
            telefono: "", items: [{ codigo: "AC001", nombre: "Cuerdas", precio: 8990, cantidad: 1 }], tipoEntrega: "despacho",
            direccion: "Calle 1", comuna: "Talca", puntoRetiro: "", medioPago: "webpay", subtotal: 8990, costoEnvio: 5990,
            total: 14980, estado: "preparacion", seguimiento: "",
        };
        const alActualizar = jasmine.createSpy("alActualizar");
        enTabla(<FilaPedido pedido={pedido} alActualizar={alActualizar} />);
        fireEvent.change(screen.getByLabelText("Estado del pedido SV-0009"), { target: { value: "despachado" } });
        fireEvent.change(screen.getByLabelText(/Número de seguimiento/), { target: { value: "STK-1" } });
        fireEvent.click(screen.getByRole("button", { name: "Guardar pedido SV-0009" }));
        expect(alActualizar).toHaveBeenCalledWith(9, "despachado", "STK-1");
    });

    it("FilaUsuario no permite desactivarse a uno mismo", () => {
        const usuario = { id: 1, rut: "11.111.111-1", nombre: "Admin", correo: "admin@x.cl", rol: "administrador" as const, activo: true };
        const alCambiarEstado = jasmine.createSpy("alCambiarEstado");
        const { rerender } = enTabla(<FilaUsuario usuario={usuario} esUsuarioActual alEditar={() => {}} alCambiarEstado={alCambiarEstado} />);
        expect((screen.getByRole("button", { name: "Desactivar" }) as HTMLButtonElement).disabled).toBeTrue();

        rerender(
            <table>
                <tbody>
                    <FilaUsuario usuario={usuario} esUsuarioActual={false} alEditar={() => {}} alCambiarEstado={alCambiarEstado} />
                </tbody>
            </table>
        );
        fireEvent.click(within(screen.getByRole("row")).getByRole("button", { name: "Desactivar" }));
        expect(alCambiarEstado).toHaveBeenCalledWith(1, false);
    });
});
