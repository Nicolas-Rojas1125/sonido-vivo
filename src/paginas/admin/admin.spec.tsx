import { fireEvent, screen, within } from "@testing-library/react";
import { productosServicio } from "../../servicios/productosServicio";
import { backend, clic, escribir, esperarBackend, iniciarSesionComo, reiniciarDatos, renderizarApp } from "../../test/utilidades";

// Las pruebas del panel usan el backend falso (src/test/backendFalso.ts): después de cada acción
// se revisa que el "servidor" haya quedado con los datos correctos.

describe("Panel de administración", () => {
    beforeEach(() => reiniciarDatos());

    it("el vendedor ve Pedidos e Inventario, pero NO Productos ni Usuarios", async () => {
        iniciarSesionComo("vendedor");
        await renderizarApp("/admin");
        const menu = within(screen.getByRole("navigation", { name: "Menú del panel" }));
        expect(menu.getByRole("link", { name: "Pedidos" })).toBeTruthy();
        expect(menu.getByRole("link", { name: "Inventario" })).toBeTruthy();
        expect(menu.queryByRole("link", { name: "Usuarios" })).toBeNull();
    });

    it("el vendedor no puede abrir la gestión de usuarios aunque escriba la URL", async () => {
        iniciarSesionComo("vendedor");
        await renderizarApp("/admin/usuarios");
        expect(screen.getByText("Acceso denegado")).toBeTruthy();
    });

    it("el resumen muestra ventas totales (GET /pedidos/resumen) y el stock crítico", async () => {
        iniciarSesionComo("administrador");
        await renderizarApp("/admin");
        expect(screen.getByText("$268.930")).toBeTruthy();
        expect(screen.getByRole("heading", { name: /Stock crítico \(11\)/ })).toBeTruthy();
    });

    it("el resumen muestra un error y permite reintentar si ms-tienda no responde", async () => {
        iniciarSesionComo("administrador");
        backend().apagar("http://localhost:8083");
        await renderizarApp("/admin");
        expect(screen.getByText(/No se pudo conectar con el servidor/)).toBeTruthy();
        backend().apagados.clear();
        await clic("Reintentar");
        expect(screen.getByText("$268.930")).toBeTruthy();
    });

    it("Pedidos: filtra por estado y actualiza un pedido", async () => {
        iniciarSesionComo("vendedor");
        await renderizarApp("/admin/pedidos");
        escribir("Filtrar pedidos por estado", "preparacion");
        expect(screen.getAllByRole("row").length).toBe(2); // encabezado + SV-0003

        escribir("Estado del pedido SV-0003", "despachado");
        escribir("Número de seguimiento del pedido SV-0003", "CHX-998877");
        await clic("Guardar pedido SV-0003");

        expect(screen.getByText('Pedido SV-0003 actualizado a "Despachado".')).toBeTruthy();
        expect(backend().pedidos.find((p) => p.id === 3)?.seguimiento).toBe("CHX-998877");
    });

    it("Inventario: guarda el nuevo stock usando el servicio (spy)", async () => {
        iniciarSesionComo("vendedor");
        const actualizarStock = spyOn(productosServicio, "actualizarStock").and.callThrough();
        await renderizarApp("/admin/inventario");
        escribir("Buscar producto", "SM57");
        escribir("Stock de Micrófono Dinámico Instrumento", "15");
        await clic("Guardar stock de Micrófono Dinámico Instrumento");
        expect(actualizarStock).toHaveBeenCalledWith("MI002", 15);
        expect(screen.getByText("Stock de MI002 actualizado a 15.")).toBeTruthy();
    });

    it("Inventario: el interruptor muestra solo productos con stock crítico", async () => {
        iniciarSesionComo("administrador");
        await renderizarApp("/admin/inventario");
        fireEvent.click(screen.getByLabelText("Mostrar solo stock crítico"));
        expect(screen.getAllByRole("row").length).toBe(12); // encabezado + 11 productos con stock 2
    });

    it("Productos: crea, edita y elimina un producto", async () => {
        iniciarSesionComo("administrador");
        await renderizarApp("/admin/productos");
        escribir("Código", "AC011");
        escribir("Categoría", "accesorios");
        escribir("Nombre", "Correa de Cuero");
        escribir("Marca", "Levy's");
        escribir("Modelo", "M17");
        escribir("Precio (CLP)", "24990");
        escribir("Stock", "6");
        escribir("Descripción breve", "Correa de cuero ajustable.");
        await clic("Crear producto");
        expect(screen.getByText("Producto AC011 creado correctamente.")).toBeTruthy();

        const fila = screen.getByText("Correa de Cuero").closest("tr")!;
        fireEvent.click(within(fila).getByRole("button", { name: "Editar" }));
        escribir("Precio (CLP)", "21990");
        await clic("Guardar cambios");
        expect(backend().productos.find((p) => p.codigo === "AC011")?.precio).toBe(21990);

        // Eliminar pide confirmación (window.confirm)
        spyOn(window, "confirm").and.returnValue(true);
        fireEvent.click(within(screen.getByText("Correa de Cuero").closest("tr")!).getByRole("button", { name: "Eliminar" }));
        await esperarBackend();
        expect(backend().productos.find((p) => p.codigo === "AC011")).toBeUndefined();
        expect(screen.getByText("Producto AC011 eliminado.")).toBeTruthy();
    });

    it("un VENDEDOR que intenta crear un producto recibe 403 del backend", async () => {
        // Aunque alguien saltara la protección de la interfaz, el backend rechaza la acción
        iniciarSesionComo("vendedor");
        await renderizarApp("/admin/inventario");
        const resultado = await productosServicio.crear({ ...backend().productos[0], codigo: "ZZ001" });
        expect(resultado.ok).toBeFalse();
        expect(resultado.mensaje).toBe("No tienes permisos para realizar esta acción.");
    });

    it("Productos: muestra error si el código ya existe", async () => {
        iniciarSesionComo("administrador");
        await renderizarApp("/admin/productos");
        escribir("Código", "GA001");
        escribir("Categoría", "guitarras-acusticas");
        escribir("Nombre", "Repetida");
        escribir("Marca", "X");
        escribir("Modelo", "Y");
        escribir("Precio (CLP)", "1000");
        escribir("Stock", "1");
        escribir("Descripción breve", "Producto repetido.");
        await clic("Crear producto");
        expect(screen.getByText("Ya existe un producto con el código GA001.")).toBeTruthy();
    });

    it("Usuarios: crea un vendedor y desactiva una cuenta", async () => {
        iniciarSesionComo("administrador");
        await renderizarApp("/admin/usuarios");
        escribir("RUT", "20.111.333-4");
        escribir("Nombre completo", "Nuevo Vendedor");
        escribir("Correo electrónico", "nuevo@sonidovivo.cl");
        escribir("Contraseña", "Vende2026");
        escribir("Confirmar contraseña", "Vende2026");
        escribir("Rol", "vendedor");
        await clic("Crear usuario");
        expect(screen.getByText("Usuario Nuevo Vendedor creado correctamente.")).toBeTruthy();

        const fila = screen.getByText("Cliente de Prueba").closest("tr")!;
        fireEvent.click(within(fila).getByRole("button", { name: "Desactivar" }));
        await esperarBackend();
        expect(backend().usuarios.find((u) => u.id === 3)?.activo).toBeFalse();
        expect(screen.getByText("Usuario Cliente de Prueba desactivado.")).toBeTruthy();
    });

    it("Usuarios: edita el rol de un usuario existente", async () => {
        iniciarSesionComo("administrador");
        await renderizarApp("/admin/usuarios");
        const fila = screen.getByText("Cliente de Prueba").closest("tr")!;
        fireEvent.click(within(fila).getByRole("button", { name: "Editar" }));
        expect(screen.getByRole("heading", { name: "Editar usuario" })).toBeTruthy();
        escribir("Rol", "vendedor");
        await clic("Guardar cambios");
        expect(backend().usuarios.find((u) => u.id === 3)?.rol).toBe("VENDEDOR");
    });

    it("Usuarios: el administrador no puede cambiar su propio rol", async () => {
        iniciarSesionComo("administrador");
        await renderizarApp("/admin/usuarios");
        const fila = screen.getByText("Dueño Sonido Vivo").closest("tr")!;
        fireEvent.click(within(fila).getByRole("button", { name: "Editar" }));
        escribir("Rol", "cliente");
        await clic("Guardar cambios");
        expect(screen.getByText(/No puedes cambiar tu propio rol/)).toBeTruthy();
        expect(backend().usuarios.find((u) => u.id === 1)?.rol).toBe("ADMINISTRADOR");
    });
});
