import { fireEvent, screen, within } from "@testing-library/react";
import { productosIniciales } from "../datos/productos";
import { URL_CONTACTOS } from "../servicios/api";
import { productosServicio } from "../servicios/productosServicio";
import { backend, clic, clicEnlace, escribir, iniciarSesionComo, prepararCarrito, reiniciarDatos, renderizarApp } from "../test/utilidades";


describe("Acceso como invitado (sin cuenta)", () => {
    beforeEach(() => reiniciarDatos());

    it("un invitado entra a la tienda sin iniciar sesión: inicio, catálogo, detalle, carrito, nosotros y contacto", async () => {
        for (const ruta of ["/", "/productos", "/productos/GA001", "/carrito", "/nosotros", "/contacto"]) {
            const { unmount } = await renderizarApp(ruta);
            expect(screen.queryByRole("heading", { name: "Iniciar sesión" })).toBeNull();
            expect(screen.getByText("Hola, invitado")).toBeTruthy();
            unmount();
        }
    });

    it("el invitado ve el catálogo del backend con filtros", async () => {
        await renderizarApp("/productos?categoria=bajos");
        expect(screen.getByRole("heading", { name: "Bajos Eléctricos" })).toBeTruthy();
        expect(screen.getByText("3 productos")).toBeTruthy();
    });

    it("las vistas de cliente y del panel siguen pidiendo sesión", async () => {
        for (const ruta of ["/checkout", "/mis-pedidos", "/admin", "/admin/usuarios"]) {
            const { unmount } = await renderizarApp(ruta);
            expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeTruthy();
            unmount();
        }
    });

    it("desde el login o el registro se puede volver a la tienda como invitado", async () => {
        await renderizarApp("/login");
        await clicEnlace("Seguir como invitado");
        expect(screen.getByText("Hola, invitado")).toBeTruthy();
        expect(screen.queryByRole("heading", { name: "Iniciar sesión" })).toBeNull();
    });

    it("después del login vuelve a la página protegida que pedía", async () => {
        await renderizarApp("/mis-pedidos");
        expect(screen.getByText("Inicia sesión o crea una cuenta para continuar.")).toBeTruthy();
        escribir("Correo electrónico", "cliente@correo.cl");
        escribir("Contraseña", "Cliente123");
        await clic("Ingresar");
        expect(screen.getByRole("heading", { name: "Mis pedidos" })).toBeTruthy();
    });

    it("si un vendedor venía del checkout, lo envía a su panel y no a 'Acceso denegado'", async () => {
        await renderizarApp("/checkout");
        escribir("Correo electrónico", "vendedor@sonidovivo.cl");
        escribir("Contraseña", "Vende123");
        await clic("Ingresar");
        expect(screen.getByRole("heading", { name: "Pedidos" })).toBeTruthy();
    });
});

describe("Página Inicio", () => {
    beforeEach(() => {
        reiniciarDatos();
        iniciarSesionComo("cliente");
    });

    it("muestra el hero, las 10 categorías y los productos destacados", async () => {
        await renderizarApp("/");
        expect(screen.getByRole("heading", { name: "Tu música empieza aquí" })).toBeTruthy();
        expect(within(screen.getByRole("region", { name: "Categorías" })).getAllByRole("link").length).toBe(10);
        expect(screen.getByText("Piano Digital 88 teclas")).toBeTruthy();
    });

    it("al agregar un destacado se actualiza el contador del carrito en el Navbar", async () => {
        await renderizarApp("/");
        await clic(/Agregar Pedal Distorsión/);
        expect(screen.getByText("Pedal Distorsión se agregó al carrito.")).toBeTruthy();
        expect(screen.getByRole("link", { name: "Carrito de compras, 1 productos" })).toBeTruthy();
    });
});

describe("Página Catálogo", () => {
    beforeEach(() => {
        reiniciarDatos();
        iniciarSesionComo("cliente");
    });

    it("lee la categoría desde la URL y filtra con los botones", async () => {
        await renderizarApp("/productos?categoria=microfonos");
        expect(screen.getByRole("heading", { name: "Micrófonos" })).toBeTruthy();
        expect(screen.getByText("4 productos")).toBeTruthy();

        await clic("Pedales");
        expect(screen.getByText("6 productos")).toBeTruthy();
        await clic("Todos");
        expect(screen.getByText("51 productos")).toBeTruthy();
    });

    it("busca por texto y muestra un mensaje si no hay resultados", async () => {
        await renderizarApp("/productos");
        escribir(/Buscar por nombre/, "boss");
        expect(screen.getByText("4 productos")).toBeTruthy();
        escribir(/Buscar por nombre/, "violín");
        expect(screen.getByText("No se encontraron productos con los filtros seleccionados.")).toBeTruthy();
    });

    it("usa el servicio de productos (MOCK: spyOn devuelve un catálogo falso)", async () => {
        const falso = [{ ...productosIniciales[0], codigo: "ZZ001", nombre: "Producto Simulado" }];
        const espia = spyOn(productosServicio, "listar").and.resolveTo(falso);
        await renderizarApp("/productos");
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

    it("muestra la información del producto y agrega la cantidad elegida", async () => {
        await renderizarApp("/productos/MI001");
        expect(screen.getByRole("heading", { name: "Micrófono Dinámico Cardioide" })).toBeTruthy();
        expect(screen.getByText("8 unidades en stock")).toBeTruthy();
        await clic("Aumentar cantidad");
        await clic("Agregar al carrito");
        expect(screen.getByText("Agregaste 2 × Micrófono Dinámico Cardioide al carrito.")).toBeTruthy();
        expect(screen.getByRole("link", { name: "Carrito de compras, 2 productos" })).toBeTruthy();
    });

    it("muestra 'Producto no encontrado' con un código inexistente", async () => {
        await renderizarApp("/productos/NOEXISTE");
        expect(screen.getByText("Producto no encontrado")).toBeTruthy();
    });
});

describe("Flujo de compra: Carrito → Checkout → Mis pedidos", () => {
    beforeEach(() => {
        reiniciarDatos();
        prepararCarrito([{ codigo: "GE005", nombre: "Guitarra Eléctrica Semi-hollow", marca: "Epiphone", precio: 549990, imagen: "", cantidad: 2, stock: 2 }]);
    });

    it("el invitado ve su carrito y, al crear su cuenta, llega directo al checkout con el mismo carrito", async () => {
        await renderizarApp("/carrito");
        expect(screen.getByTestId("total").textContent).toBe("$1.099.980");
        expect(screen.queryByRole("button", { name: "Continuar con la compra" })).toBeNull();
        expect(screen.getByRole("note").textContent).toContain("invitado");

        await clic("Crear cuenta y comprar");
        expect(screen.getByText("Crea tu cuenta para finalizar la compra. Tu carrito se mantiene.")).toBeTruthy();
        escribir("RUT", "18.765.432-7");
        escribir("Nombre completo", "Javiera Muñoz");
        escribir("Correo electrónico", "javiera@correo.cl");
        escribir("Contraseña", "Clave1234");
        escribir("Confirmar contraseña", "Clave1234");
        await clic("Crear mi cuenta");

        expect(screen.getByRole("heading", { name: "Finalizar compra" })).toBeTruthy();
        expect(screen.getByText("Hola, Javiera")).toBeTruthy();
        expect(backend().usuarios.some((u) => u.correo === "javiera@correo.cl" && u.rol === "CLIENTE")).toBeTrue();
    });

    it("el invitado que ya tiene cuenta inicia sesión desde el carrito y vuelve al checkout", async () => {
        await renderizarApp("/carrito");
        await clicEnlace("Ya tengo cuenta: iniciar sesión");
        escribir("Correo electrónico", "cliente@correo.cl");
        escribir("Contraseña", "Cliente123");
        await clic("Ingresar");
        expect(screen.getByRole("heading", { name: "Finalizar compra" })).toBeTruthy();
    });

    it("el carrito muestra el total y el cliente continúa al checkout", async () => {
        iniciarSesionComo("cliente");
        await renderizarApp("/carrito");
        expect(screen.getByTestId("total").textContent).toBe("$1.099.980");
        await clic("Continuar con la compra");
        expect(screen.getByRole("heading", { name: "Finalizar compra" })).toBeTruthy();
    });

    it("un vendedor ve el carrito pero no puede hacer pedidos", async () => {
        iniciarSesionComo("vendedor");
        await renderizarApp("/carrito");
        expect(screen.queryByRole("button", { name: "Continuar con la compra" })).toBeNull();
        expect(screen.getByRole("note").textContent).toContain("cuenta de Cliente");
    });

    it("en el carrito se puede cambiar la cantidad, quitar productos y queda vacío", async () => {
        iniciarSesionComo("cliente");
        await renderizarApp("/carrito");
        await clic("Disminuir cantidad");
        expect(screen.getByTestId("total").textContent).toBe("$549.990");
        await clic("Quitar Guitarra Eléctrica Semi-hollow del carrito");
        expect(screen.getByText("Tu carrito está vacío")).toBeTruthy();
    });

    it("un cliente confirma el pedido: se crea, se descuenta stock y se vacía el carrito", async () => {
        iniciarSesionComo("cliente");
        await renderizarApp("/checkout");
        expect(screen.getByTestId("total").textContent).toBe("$1.105.970"); // incluye despacho $5.990

        fireEvent.click(screen.getByLabelText(/Retiro en tienda/));
        expect(screen.getByTestId("total").textContent).toBe("$1.099.980"); // retiro = gratis

        escribir("Teléfono", "+56 9 1234 5678");
        escribir("Punto de retiro", "tienda");
        escribir("Medio de pago", "webpay");
        await clic("Confirmar pedido");

        expect(screen.getByRole("heading", { name: "Mis pedidos" })).toBeTruthy();
        expect(screen.getByText(/Tu pedido SV-0004 fue recibido/)).toBeTruthy();
        // El "servidor" descontó el stock y guardó el pedido con el correo del token
        expect(backend().productos.find((p) => p.codigo === "GE005")?.stock).toBe(0);
        const creado = backend().pedidos.find((p) => p.numero === "SV-0004");
        expect(creado?.tipoEntrega).toBe("retiro");
        expect(creado?.clienteCorreo).toBe("cliente@correo.cl");
        expect(screen.getByRole("link", { name: "Carrito de compras, 0 productos" })).toBeTruthy();
    });

    it("si el stock ya no alcanza el backend responde 409: muestra el error y NO crea el pedido", async () => {
        iniciarSesionComo("cliente");
        await renderizarApp("/checkout");
        // Otra persona compró justo antes: en el servidor queda solo 1 unidad
        backend().productos.find((p) => p.codigo === "GE005")!.stock = 1;

        escribir("Teléfono", "+56 9 1234 5678");
        escribir("Dirección", "Av. Libertad 100");
        escribir("Comuna", "Viña del Mar");
        escribir("Medio de pago", "transferencia");
        await clic("Confirmar pedido");

        expect(screen.getByText("Stock insuficiente para Guitarra Eléctrica Semi-hollow. Disponible: 1.")).toBeTruthy();
        expect(backend().pedidos.length).toBe(3); // no se creó ningún pedido
        expect(screen.getByRole("heading", { name: "Finalizar compra" })).toBeTruthy();
    });
});

describe("Página Mis pedidos", () => {
    beforeEach(() => reiniciarDatos());

    it("el cliente ve solo sus pedidos con su estado", async () => {
        iniciarSesionComo("cliente");
        await renderizarApp("/mis-pedidos");
        expect(screen.getByText("SV-0001")).toBeTruthy();
        expect(screen.getByText("SV-0002")).toBeTruthy();
        expect(screen.queryByText("SV-0003")).toBeNull(); // es de otra clienta
        expect(screen.getByText("N° seguimiento: STK-4455123")).toBeTruthy();
    });

    it("un vendedor no puede entrar a 'Mis pedidos'", async () => {
        iniciarSesionComo("vendedor");
        await renderizarApp("/mis-pedidos");
        expect(screen.getByText("Acceso denegado")).toBeTruthy();
    });
});

describe("Páginas Login y Registro", () => {
    beforeEach(() => reiniciarDatos());

    it("muestra error con credenciales incorrectas", async () => {
        await renderizarApp("/login");
        escribir("Correo electrónico", "admin@sonidovivo.cl");
        escribir("Contraseña", "incorrecta");
        await clic("Ingresar");
        expect(screen.getByText("Correo o contraseña incorrectos.")).toBeTruthy();
    });

    it("el administrador entra y es enviado al panel", async () => {
        await renderizarApp("/login");
        escribir("Correo electrónico", "admin@sonidovivo.cl");
        escribir("Contraseña", "Admin123");
        await clic("Ingresar");
        expect(screen.getByRole("heading", { name: "Resumen de la tienda" })).toBeTruthy();
    });

    it("el registro crea la cuenta, inicia sesión y avisa si el correo ya existe", async () => {
        await renderizarApp("/registro");
        escribir("RUT", "18.765.432-7");
        escribir("Nombre completo", "Javiera Muñoz");
        escribir("Correo electrónico", "cliente@correo.cl");
        escribir("Contraseña", "Clave1234");
        escribir("Confirmar contraseña", "Clave1234");
        await clic("Crear mi cuenta");
        expect(screen.getByText("Ya existe una cuenta con ese correo.")).toBeTruthy();

        escribir("Correo electrónico", "javiera@correo.cl");
        await clic("Crear mi cuenta");
        expect(screen.getByRole("heading", { name: "Tu música empieza aquí" })).toBeTruthy();
        expect(screen.getByText("Hola, Javiera")).toBeTruthy();
    });
});

describe("Páginas Contacto, Nosotros y 404", () => {
    beforeEach(() => {
        reiniciarDatos();
        iniciarSesionComo("cliente");
    });

    const completarContacto = () => {
        escribir("Nombre completo", "Tomás Vera");
        escribir("Correo electrónico", "tomas@correo.cl");
        escribir("Asunto", "stock");
        escribir("Mensaje", "¿Tienen stock del pedal Boss DS-1?");
    };

    it("Contacto: envía el formulario al backend (POST), muestra confirmación y el mapa con los puntos de retiro", async () => {
        await renderizarApp("/contacto");
        completarContacto();
        await clic("Enviar mensaje");

        expect(screen.getByText(/¡Gracias, Tomás Vera!/)).toBeTruthy();
        expect(backend().contactos.length).toBe(1);
        expect(backend().contactos[0].estado).toBe("PENDIENTE");
        expect(document.querySelector(".leaflet-container")).not.toBeNull();
        expect(screen.getAllByRole("link", { name: /Cómo llegar/ }).length).toBeGreaterThanOrEqual(3);
    });

    it("Contacto: un invitado (sin cuenta) también puede enviar un mensaje", async () => {
        backend().cookieRefresh = null; // sin sesión: entra como invitado
        await renderizarApp("/contacto");
        expect(screen.getByText("Hola, invitado")).toBeTruthy();
        completarContacto();
        await clic("Enviar mensaje");
        expect(screen.getByText(/¡Gracias, Tomás Vera!/)).toBeTruthy();
        expect(backend().contactos.length).toBe(1);
    });

    it("Contacto: si el backend no responde muestra un error y conserva los datos escritos", async () => {
        // Simula que ms-contactos está apagado (error de red)
        backend().apagar(URL_CONTACTOS);
        spyOn(console, "error"); // evita ensuciar la salida de las pruebas
        await renderizarApp("/contacto");
        completarContacto();
        await clic("Enviar mensaje");

        expect(screen.getByText(/No se pudo enviar el mensaje/)).toBeTruthy();
        expect((screen.getByLabelText("Nombre completo") as HTMLInputElement).value).toBe("Tomás Vera");
    });

    it("Nosotros muestra misión y visión", async () => {
        await renderizarApp("/nosotros");
        expect(screen.getByRole("heading", { name: "Misión" })).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Visión" })).toBeTruthy();
    });

    it("una ruta inexistente muestra la página 404", async () => {
        await renderizarApp("/no-existe");
        expect(screen.getByText("Página no encontrada")).toBeTruthy();
    });
});
