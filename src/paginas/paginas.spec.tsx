import { fireEvent, screen, within } from "@testing-library/react";
import { productosIniciales } from "../datos/productos";
import { pedidosServicio } from "../servicios/pedidosServicio";
import { productosServicio } from "../servicios/productosServicio";
import { escribir, iniciarSesionComo, prepararCarrito, reiniciarDatos, renderizarApp } from "../test/utilidades";

const clic = (nombre: string | RegExp) => fireEvent.click(screen.getByRole("button", { name: nombre }));

describe("Regla de seguridad: vistas solo con sesión iniciada", () => {
    beforeEach(() => reiniciarDatos());

    it("sin sesión, el inicio, el catálogo y el contacto redirigen al login", () => {
        for (const ruta of ["/", "/productos", "/productos/GA001", "/contacto"]) {
            const { unmount } = renderizarApp(ruta);
            expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeTruthy();
            unmount();
        }
    });

    it("el registro es público y el menú solo ofrece ingresar o crear cuenta", () => {
        renderizarApp("/registro");
        expect(screen.getByRole("heading", { name: "Crear cuenta" })).toBeTruthy();
        expect(screen.queryByRole("link", { name: "Catálogo" })).toBeNull();
        expect(screen.queryByRole("link", { name: /Carrito de compras/ })).toBeNull();
    });

    it("después del login vuelve a la página pedida, incluyendo el filtro de la URL", () => {
        renderizarApp("/productos?categoria=bajos");
        escribir("Correo electrónico", "cliente@correo.cl");
        escribir("Contraseña", "Cliente123");
        clic("Ingresar");
        expect(screen.getByRole("heading", { name: "Bajos Eléctricos" })).toBeTruthy();
        expect(screen.getByText("3 productos")).toBeTruthy();
    });

    it("si un vendedor venía del checkout, lo envía a su panel y no a 'Acceso denegado'", () => {
        renderizarApp("/checkout");
        escribir("Correo electrónico", "vendedor@sonidovivo.cl");
        escribir("Contraseña", "Vende123");
        clic("Ingresar");
        expect(screen.getByRole("heading", { name: "Pedidos" })).toBeTruthy();
    });
});

describe("Página Inicio", () => {
    beforeEach(() => {
        reiniciarDatos();
        iniciarSesionComo("cliente");
    });

    it("muestra el hero, las 10 categorías y los productos destacados", () => {
        renderizarApp("/");
        expect(screen.getByRole("heading", { name: "Tu música empieza aquí" })).toBeTruthy();
        expect(within(screen.getByRole("region", { name: "Categorías" })).getAllByRole("link").length).toBe(10);
        expect(screen.getByText("Piano Digital 88 teclas")).toBeTruthy();
    });

    it("al agregar un destacado se actualiza el contador del carrito en el Navbar", () => {
        renderizarApp("/");
        clic(/Agregar Pedal Distorsión/);
        expect(screen.getByText("Pedal Distorsión se agregó al carrito.")).toBeTruthy();
        expect(screen.getByRole("link", { name: "Carrito de compras, 1 productos" })).toBeTruthy();
    });
});

describe("Página Catálogo", () => {
    beforeEach(() => {
        reiniciarDatos();
        iniciarSesionComo("cliente");
    });

    it("lee la categoría desde la URL y filtra con los botones", () => {
        renderizarApp("/productos?categoria=microfonos");
        expect(screen.getByRole("heading", { name: "Micrófonos" })).toBeTruthy();
        expect(screen.getByText("4 productos")).toBeTruthy();

        clic("Pedales");
        expect(screen.getByText("6 productos")).toBeTruthy();
        clic("Todos");
        expect(screen.getByText("51 productos")).toBeTruthy();
    });

    it("busca por texto y muestra un mensaje si no hay resultados", () => {
        renderizarApp("/productos");
        escribir(/Buscar por nombre/, "boss");
        expect(screen.getByText("4 productos")).toBeTruthy();
        escribir(/Buscar por nombre/, "violín");
        expect(screen.getByText("No se encontraron productos con los filtros seleccionados.")).toBeTruthy();
    });

    it("usa el servicio de productos (MOCK: spyOn devuelve un catálogo falso)", () => {
        const falso = [{ ...productosIniciales[0], codigo: "ZZ001", nombre: "Producto Simulado" }];
        const espia = spyOn(productosServicio, "obtenerTodos").and.returnValue(falso);
        renderizarApp("/productos");
        expect(espia).toHaveBeenCalled();
        expect(screen.getByText("Producto Simulado")).toBeTruthy();
        expect(screen.getByText("1 producto")).toBeTruthy();
    });
});

describe("Página Detalle de producto", () => {
    beforeEach(() => {
        reiniciarDatos();
        iniciarSesionComo("cliente");
    });

    it("muestra la información del producto y agrega la cantidad elegida", () => {
        renderizarApp("/productos/MI001");
        expect(screen.getByRole("heading", { name: "Micrófono Dinámico Cardioide" })).toBeTruthy();
        expect(screen.getByText("8 unidades en stock")).toBeTruthy();
        clic("Aumentar cantidad");
        clic("Agregar al carrito");
        expect(screen.getByText("Agregaste 2 × Micrófono Dinámico Cardioide al carrito.")).toBeTruthy();
        expect(screen.getByRole("link", { name: "Carrito de compras, 2 productos" })).toBeTruthy();
    });

    it("muestra 'Producto no encontrado' con un código inexistente", () => {
        renderizarApp("/productos/NOEXISTE");
        expect(screen.getByText("Producto no encontrado")).toBeTruthy();
    });
});

describe("Flujo de compra: Carrito → Checkout → Mis pedidos", () => {
    beforeEach(() => {
        reiniciarDatos();
        prepararCarrito([{ codigo: "GE005", nombre: "Guitarra Eléctrica Semi-hollow", marca: "Epiphone", precio: 549990, imagen: "", cantidad: 2, stock: 2 }]);
    });

    it("sin sesión pide iniciar sesión y después vuelve al carrito", () => {
        renderizarApp("/carrito");
        expect(screen.getByText("Inicia sesión o crea una cuenta para continuar.")).toBeTruthy();
        escribir("Correo electrónico", "cliente@correo.cl");
        escribir("Contraseña", "Cliente123");
        clic("Ingresar");
        expect(screen.getByRole("heading", { name: "Carrito de compras" })).toBeTruthy();
    });

    it("el carrito muestra el total y el cliente continúa al checkout", () => {
        iniciarSesionComo("cliente");
        renderizarApp("/carrito");
        expect(screen.getByTestId("total").textContent).toBe("$1.099.980");
        clic("Continuar con la compra");
        expect(screen.getByRole("heading", { name: "Finalizar compra" })).toBeTruthy();
    });

    it("un vendedor ve el carrito pero no puede hacer pedidos", () => {
        iniciarSesionComo("vendedor");
        renderizarApp("/carrito");
        expect(screen.queryByRole("button", { name: "Continuar con la compra" })).toBeNull();
        expect(screen.getByRole("note").textContent).toContain("cuenta de Cliente");
    });

    it("en el carrito se puede cambiar la cantidad, quitar productos y queda vacío", () => {
        iniciarSesionComo("cliente");
        renderizarApp("/carrito");
        clic("Disminuir cantidad");
        expect(screen.getByTestId("total").textContent).toBe("$549.990");
        clic("Quitar Guitarra Eléctrica Semi-hollow del carrito");
        expect(screen.getByText("Tu carrito está vacío")).toBeTruthy();
    });

    it("un cliente confirma el pedido: se crea, se descuenta stock y se vacía el carrito", () => {
        iniciarSesionComo("cliente");
        renderizarApp("/checkout");
        expect(screen.getByTestId("total").textContent).toBe("$1.105.970"); // incluye despacho $5.990

        fireEvent.click(screen.getByLabelText(/Retiro en tienda/));
        expect(screen.getByTestId("total").textContent).toBe("$1.099.980"); // retiro = gratis

        escribir("Teléfono", "+56 9 1234 5678");
        escribir("Punto de retiro", "tienda");
        escribir("Medio de pago", "webpay");
        clic("Confirmar pedido");

        expect(screen.getByRole("heading", { name: "Mis pedidos" })).toBeTruthy();
        expect(screen.getByText(/Tu pedido SV-0004 fue recibido/)).toBeTruthy();
        expect(productosServicio.obtenerPorCodigo("GE005")?.stock).toBe(0);
        expect(pedidosServicio.obtenerPorCliente("cliente@correo.cl")[0].tipoEntrega).toBe("retiro");
        expect(screen.getByRole("link", { name: "Carrito de compras, 0 productos" })).toBeTruthy();
    });

    it("si el stock ya no alcanza muestra el error y NO crea el pedido (mock del servicio)", () => {
        iniciarSesionComo("cliente");
        spyOn(productosServicio, "descontarStock").and.returnValue({ ok: false, mensaje: "Stock insuficiente para Guitarra Eléctrica Semi-hollow. Disponible: 1." });
        const crear = spyOn(pedidosServicio, "crear").and.callThrough();
        renderizarApp("/checkout");

        escribir("Teléfono", "+56 9 1234 5678");
        escribir("Dirección", "Av. Libertad 100");
        escribir("Comuna", "Viña del Mar");
        escribir("Medio de pago", "transferencia");
        clic("Confirmar pedido");

        expect(screen.getByText(/Stock insuficiente/)).toBeTruthy();
        expect(crear).not.toHaveBeenCalled();
    });
});

describe("Página Mis pedidos", () => {
    beforeEach(() => reiniciarDatos());

    it("el cliente ve solo sus pedidos con su estado", () => {
        iniciarSesionComo("cliente");
        renderizarApp("/mis-pedidos");
        expect(screen.getByText("SV-0001")).toBeTruthy();
        expect(screen.getByText("SV-0002")).toBeTruthy();
        expect(screen.queryByText("SV-0003")).toBeNull(); // es de otra clienta
        expect(screen.getByText("N° seguimiento: STK-4455123")).toBeTruthy();
    });

    it("un vendedor no puede entrar a 'Mis pedidos'", () => {
        iniciarSesionComo("vendedor");
        renderizarApp("/mis-pedidos");
        expect(screen.getByText("Acceso denegado")).toBeTruthy();
    });
});

describe("Páginas Login y Registro", () => {
    beforeEach(() => reiniciarDatos());

    it("muestra error con credenciales incorrectas", () => {
        renderizarApp("/login");
        escribir("Correo electrónico", "admin@sonidovivo.cl");
        escribir("Contraseña", "incorrecta");
        clic("Ingresar");
        expect(screen.getByText("Correo o contraseña incorrectos.")).toBeTruthy();
    });

    it("el administrador entra y es enviado al panel", () => {
        renderizarApp("/login");
        escribir("Correo electrónico", "admin@sonidovivo.cl");
        escribir("Contraseña", "Admin123");
        clic("Ingresar");
        expect(screen.getByRole("heading", { name: "Resumen de la tienda" })).toBeTruthy();
    });

    it("el registro crea la cuenta, inicia sesión y avisa si el correo ya existe", () => {
        renderizarApp("/registro");
        escribir("RUT", "18.765.432-7");
        escribir("Nombre completo", "Javiera Muñoz");
        escribir("Correo electrónico", "cliente@correo.cl");
        escribir("Contraseña", "Clave1234");
        escribir("Confirmar contraseña", "Clave1234");
        clic("Crear mi cuenta");
        expect(screen.getByText("Ya existe una cuenta con ese correo.")).toBeTruthy();

        escribir("Correo electrónico", "javiera@correo.cl");
        clic("Crear mi cuenta");
        expect(screen.getByRole("heading", { name: "Tu música empieza aquí" })).toBeTruthy();
        expect(screen.getByText("Hola, Javiera")).toBeTruthy();
    });
});

describe("Páginas Contacto, Nosotros y 404", () => {
    beforeEach(() => {
        reiniciarDatos();
        iniciarSesionComo("cliente");
    });

    it("Contacto: envía el formulario, muestra confirmación y el mapa con los puntos de retiro", () => {
        renderizarApp("/contacto");
        escribir("Nombre completo", "Tomás Vera");
        escribir("Correo electrónico", "tomas@correo.cl");
        escribir("Asunto", "stock");
        escribir("Mensaje", "¿Tienen stock del pedal Boss DS-1?");
        clic("Enviar mensaje");
        expect(screen.getByText(/¡Gracias, Tomás Vera!/)).toBeTruthy();
        expect(document.querySelector(".leaflet-container")).not.toBeNull();
        expect(screen.getAllByRole("link", { name: /Cómo llegar/ }).length).toBeGreaterThanOrEqual(3);
    });

    it("Nosotros muestra misión y visión", () => {
        renderizarApp("/nosotros");
        expect(screen.getByRole("heading", { name: "Misión" })).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Visión" })).toBeTruthy();
    });

    it("una ruta inexistente muestra la página 404", () => {
        renderizarApp("/no-existe");
        expect(screen.getByText("Página no encontrada")).toBeTruthy();
    });
});
