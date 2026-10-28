import { fireEvent, render, screen } from "@testing-library/react";
import Alerta from "./Alerta";
import Boton from "./Boton";
import ImagenProducto, { IMAGEN_RESPALDO } from "./ImagenProducto";
import Input from "./Input";
import Insignia from "./Insignia";
import MensajeError from "./MensajeError";
import Selector from "./Selector";

describe("Átomo Boton", () => {
    it("muestra el texto y aplica las clases de Bootstrap según sus props", () => {
        render(<Boton texto="Comprar" variante="danger" tamano="sm" anchoCompleto />);
        const boton = screen.getByRole("button", { name: "Comprar" });
        expect(boton.className).toBe("btn btn-danger btn-sm w-100");
        expect(boton.getAttribute("type")).toBe("button");
    });

    it("ejecuta la función alClick al hacer clic (mock con jasmine.createSpy)", () => {
        const alClick = jasmine.createSpy("alClick");
        render(<Boton texto="Agregar" alClick={alClick} />);
        fireEvent.click(screen.getByRole("button", { name: "Agregar" }));
        expect(alClick).toHaveBeenCalledTimes(1);
    });

    it("no ejecuta alClick cuando está deshabilitado", () => {
        const alClick = jasmine.createSpy("alClick");
        render(<Boton texto="Sin stock" deshabilitado alClick={alClick} />);
        const boton = screen.getByRole("button", { name: "Sin stock" }) as HTMLButtonElement;
        fireEvent.click(boton);
        expect(boton.disabled).toBeTrue();
        expect(alClick).not.toHaveBeenCalled();
    });

    it("como filtro indica si está activo con aria-pressed", () => {
        render(<Boton texto="Bajos" variante="filtro" activo />);
        const boton = screen.getByRole("button", { name: "Bajos" });
        expect(boton.classList).toContain("active");
        expect(boton.getAttribute("aria-pressed")).toBe("true");
    });
});

describe("Átomo Input", () => {
    it("entrega el texto escrito a la prop alCambiar y marca el estado inválido", () => {
        const alCambiar = jasmine.createSpy("alCambiar");
        render(<Input tipo="text" nombre="correo" valor="" invalido etiquetaAria="Correo" alCambiar={alCambiar} />);
        const input = screen.getByLabelText("Correo");
        fireEvent.change(input, { target: { value: "hola@correo.cl" } });
        expect(alCambiar).toHaveBeenCalledWith("hola@correo.cl");
        expect(input.classList).toContain("is-invalid");
        expect(input.getAttribute("aria-describedby")).toBe("correo-error");
    });
});

describe("Átomo Selector", () => {
    it("muestra la opción vacía solo si se indica textoVacio y avisa el cambio", () => {
        const alCambiar = jasmine.createSpy("alCambiar");
        const opciones = [
            { valor: "a", etiqueta: "Opción A" },
            { valor: "b", etiqueta: "Opción B" },
        ];
        const { rerender } = render(<Selector nombre="s" valor="" opciones={opciones} textoVacio="Elige" etiquetaAria="Lista" alCambiar={alCambiar} />);
        expect(screen.getAllByRole("option").length).toBe(3);
        fireEvent.change(screen.getByLabelText("Lista"), { target: { value: "b" } });
        expect(alCambiar).toHaveBeenCalledWith("b");

        rerender(<Selector nombre="s" valor="a" opciones={opciones} etiquetaAria="Lista" alCambiar={alCambiar} />);
        expect(screen.getAllByRole("option").length).toBe(2);
    });
});

describe("Átomo ImagenProducto", () => {
    it("muestra la imagen indicada", () => {
        render(<ImagenProducto src="/imagenes/productos/GA001.jpg" alt="Guitarra" />);
        expect(screen.getByAltText("Guitarra").getAttribute("src")).toBe("/imagenes/productos/GA001.jpg");
    });

    it("cambia a la imagen de respaldo si la foto no carga (evento error)", () => {
        render(<ImagenProducto src="/no-existe.jpg" alt="Producto" />);
        const imagen = screen.getByAltText("Producto");
        fireEvent.error(imagen);
        expect(imagen.getAttribute("src")).toBe(IMAGEN_RESPALDO);
    });
});

describe("Átomos Alerta, Insignia y MensajeError", () => {
    it("Alerta no se muestra si el texto está vacío y permite cerrarse", () => {
        const alCerrar = jasmine.createSpy("alCerrar");
        const { rerender } = render(<Alerta texto="" />);
        expect(screen.queryByRole("status")).toBeNull();

        rerender(<Alerta texto="Guardado" tipo="success" alCerrar={alCerrar} />);
        expect(screen.getByRole("status").textContent).toContain("Guardado");
        fireEvent.click(screen.getByRole("button", { name: "Cerrar mensaje" }));
        expect(alCerrar).toHaveBeenCalled();
    });

    it("Insignia usa el color de Bootstrap recibido", () => {
        render(<Insignia texto="Agotado" color="secondary" />);
        expect(screen.getByText("Agotado").className).toBe("badge text-bg-secondary");
    });

    it("MensajeError solo aparece cuando hay error", () => {
        const { container, rerender } = render(<MensajeError texto={undefined} />);
        expect(container.innerHTML).toBe("");
        rerender(<MensajeError id="x-error" texto="Campo obligatorio" />);
        expect(screen.getByText("Campo obligatorio").id).toBe("x-error");
    });
});
