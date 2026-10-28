import { fireEvent, render, screen } from "@testing-library/react";
import { escribir } from "../../test/utilidades";
import FormularioCheckout from "./FormularioCheckout";
import FormularioContacto from "./FormularioContacto";
import FormularioLogin from "./FormularioLogin";
import FormularioProducto from "./FormularioProducto";
import FormularioUsuario from "./FormularioUsuario";
import { productosIniciales } from "../../datos/productos";

const enviar = (nombreBoton: string | RegExp) => fireEvent.click(screen.getByRole("button", { name: nombreBoton }));

describe("Organismo FormularioContacto", () => {
    it("con campos vacíos muestra los errores y NO llama a alEnviar", () => {
        const alEnviar = jasmine.createSpy("alEnviar");
        render(<FormularioContacto alEnviar={alEnviar} />);
        enviar("Enviar mensaje");
        expect(screen.getByText("Ingresa un nombre de al menos 3 caracteres.")).toBeTruthy();
        expect(screen.getByText("Selecciona un asunto.")).toBeTruthy();
        expect(alEnviar).not.toHaveBeenCalled();
    });

    it("con datos válidos llama a alEnviar con los datos y limpia el formulario", () => {
        const alEnviar = jasmine.createSpy("alEnviar");
        render(<FormularioContacto alEnviar={alEnviar} />);
        escribir("Nombre completo", "Camila Soto");
        escribir("Correo electrónico", "camila@correo.cl");
        escribir("Asunto", "reparacion");
        escribir("Mensaje", "Necesito calibrar mi guitarra.");
        enviar("Enviar mensaje");

        expect(alEnviar).toHaveBeenCalledOnceWith(
            jasmine.objectContaining({ nombre: "Camila Soto", asunto: "reparacion" })
        );
        expect((screen.getByLabelText("Nombre completo") as HTMLInputElement).value).toBe("");
    });
});

describe("Organismo FormularioLogin", () => {
    it("valida el correo antes de intentar ingresar", () => {
        const alIngresar = jasmine.createSpy("alIngresar");
        render(<FormularioLogin alIngresar={alIngresar} />);
        escribir("Correo electrónico", "sin-arroba");
        enviar("Ingresar");
        expect(screen.getByText("Ingresa un correo electrónico válido.")).toBeTruthy();
        expect(alIngresar).not.toHaveBeenCalled();
    });

    it("entrega correo y contraseña al padre", () => {
        const alIngresar = jasmine.createSpy("alIngresar");
        render(<FormularioLogin alIngresar={alIngresar} />);
        escribir("Correo electrónico", "admin@sonidovivo.cl");
        escribir("Contraseña", "Admin123");
        enviar("Ingresar");
        expect(alIngresar).toHaveBeenCalledWith({ correo: "admin@sonidovivo.cl", clave: "Admin123" });
    });
});

describe("Organismo FormularioUsuario", () => {
    it("en modo registro no muestra el selector de rol y siempre envía rol cliente", () => {
        const alGuardar = jasmine.createSpy("alGuardar");
        render(<FormularioUsuario modo="registro" alGuardar={alGuardar} />);
        expect(screen.queryByLabelText("Rol")).toBeNull();

        escribir("RUT", "123456785");
        escribir("Nombre completo", "Pedro Rojas");
        escribir("Correo electrónico", "pedro@correo.cl");
        escribir("Contraseña", "Clave1234");
        escribir("Confirmar contraseña", "Clave1234");
        enviar("Crear usuario");

        expect(alGuardar).toHaveBeenCalledWith({
            rut: "12.345.678-5",
            nombre: "Pedro Rojas",
            correo: "pedro@correo.cl",
            clave: "Clave1234",
            rol: "cliente",
        });
    });

    it("en modo admin muestra error de RUT inválido y de contraseñas distintas", () => {
        const alGuardar = jasmine.createSpy("alGuardar");
        render(<FormularioUsuario modo="admin" alGuardar={alGuardar} />);
        escribir("RUT", "12.345.678-0");
        escribir("Contraseña", "Clave1234");
        escribir("Confirmar contraseña", "Clave9999");
        enviar("Crear usuario");
        expect(screen.getByText(/Ingresa un RUT válido/)).toBeTruthy();
        expect(screen.getByText("Las contraseñas no coinciden.")).toBeTruthy();
        expect(screen.getByText("Selecciona un rol.")).toBeTruthy();
        expect(alGuardar).not.toHaveBeenCalled();
    });

    it("en edición carga los datos del usuario recibido por props", () => {
        const usuario = { id: 2, rut: "12.345.678-5", nombre: "Vendedor", correo: "v@x.cl", rol: "vendedor" as const, activo: true };
        render(<FormularioUsuario modo="admin" usuarioInicial={usuario} alGuardar={() => {}} alCancelar={() => {}} />);
        expect((screen.getByLabelText("Nombre completo") as HTMLInputElement).value).toBe("Vendedor");
        expect((screen.getByLabelText("Rol") as HTMLSelectElement).value).toBe("vendedor");
        expect(screen.getByLabelText("Nueva contraseña (opcional)")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Cancelar" })).toBeTruthy();
    });
});

describe("Organismo FormularioProducto", () => {
    it("convierte el código a mayúsculas y envía precio y stock como números", () => {
        const alGuardar = jasmine.createSpy("alGuardar");
        render(<FormularioProducto alGuardar={alGuardar} />);
        escribir("Código", "ga006");
        escribir("Categoría", "guitarras-acusticas");
        escribir("Nombre", "Guitarra Folk Junior");
        escribir("Marca", "Yamaha");
        escribir("Modelo", "FS100");
        escribir("Precio (CLP)", "99990");
        escribir("Stock", "4");
        escribir("Descripción breve", "Guitarra de tamaño reducido.");
        enviar("Crear producto");

        expect(alGuardar).toHaveBeenCalledWith(
            jasmine.objectContaining({ codigo: "GA006", precio: 99990, stock: 4, imagen: "/imagenes/productos/GA006.jpg" })
        );
    });

    it("no envía el formulario si hay errores", () => {
        const alGuardar = jasmine.createSpy("alGuardar");
        render(<FormularioProducto alGuardar={alGuardar} />);
        enviar("Crear producto");
        expect(screen.getByText("Selecciona una categoría.")).toBeTruthy();
        expect(alGuardar).not.toHaveBeenCalled();
    });

    it("en edición muestra el código como texto (no se puede cambiar)", () => {
        render(<FormularioProducto productoInicial={productosIniciales[0]} alGuardar={() => {}} />);
        expect(screen.getByText("Editar producto GA001")).toBeTruthy();
        expect(screen.queryByLabelText("Código")).toBeNull();
        expect((screen.getByLabelText("Precio (CLP)") as HTMLInputElement).value).toBe("129990");
    });
});

describe("Organismo FormularioCheckout", () => {
    it("avisa al padre cuando cambia el tipo de entrega", () => {
        const alCambiarEntrega = jasmine.createSpy("alCambiarEntrega");
        render(<FormularioCheckout nombreInicial="Ana" correoInicial="ana@x.cl" tipoEntrega="despacho" alCambiarEntrega={alCambiarEntrega} alConfirmar={() => {}} />);
        expect(screen.getByLabelText("Dirección")).toBeTruthy();
        fireEvent.click(screen.getByLabelText(/Retiro en tienda/));
        expect(alCambiarEntrega).toHaveBeenCalledWith("retiro");
    });

    it("con retiro pide punto de retiro y envía los datos completos", () => {
        const alConfirmar = jasmine.createSpy("alConfirmar");
        render(<FormularioCheckout nombreInicial="Ana Pérez" correoInicial="ana@x.cl" tipoEntrega="retiro" alCambiarEntrega={() => {}} alConfirmar={alConfirmar} />);
        expect(screen.queryByLabelText("Dirección")).toBeNull();
        escribir("Teléfono", "+56 9 1234 5678");
        enviar("Confirmar pedido");
        expect(screen.getByText("Selecciona un punto de retiro.")).toBeTruthy();

        escribir("Punto de retiro", "santiago-centro");
        escribir("Medio de pago", "transferencia");
        enviar("Confirmar pedido");
        expect(alConfirmar).toHaveBeenCalledWith(
            jasmine.objectContaining({ tipoEntrega: "retiro", puntoRetiro: "santiago-centro", medioPago: "transferencia", nombre: "Ana Pérez" })
        );
    });
});
