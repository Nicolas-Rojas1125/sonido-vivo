import { fireEvent, screen, within } from "@testing-library/react";
import { pedidosServicio } from "../../servicios/pedidosServicio";
import { productosServicio } from "../../servicios/productosServicio";
import { usuariosServicio } from "../../servicios/usuariosServicio";
import { escribir, iniciarSesionComo, reiniciarDatos, renderizarApp } from "../../test/utilidades";

const clic = (nombre: string | RegExp) => fireEvent.click(screen.getByRole("button", { name: nombre }));

describe("Panel de administración", () => {
    beforeEach(() => reiniciarDatos());

    it("el vendedor ve Pedidos e Inventario, pero NO Productos ni Usuarios", () => {
        iniciarSesionComo("vendedor");
        renderizarApp("/admin");
        const menu = within(screen.getByRole("navigation", { name: "Menú del panel" }));
        expect(menu.getByRole("link", { name: "Pedidos" })).toBeTruthy();
        expect(menu.getByRole("link", { name: "Inventario" })).toBeTruthy();
        expect(menu.queryByRole("link", { name: "Usuarios" })).toBeNull();
    });

    it("el vendedor no puede abrir la gestión de usuarios aunque escriba la URL", () => {
        iniciarSesionComo("vendedor");
        renderizarApp("/admin/usuarios");
        expect(screen.getByText("Acceso denegado")).toBeTruthy();
    });

    it("el resumen muestra ventas totales y permite restablecer los datos", () => {
        iniciarSesionComo("administrador");
        productosServicio.eliminar("GA001");
        renderizarApp("/admin");
        expect(screen.getByText("$268.930")).toBeTruthy();
        clic("Restablecer datos");
        expect(productosServicio.obtenerPorCodigo("GA001")).toBeDefined();
        expect(screen.getByText(/Se restablecieron los datos/)).toBeTruthy();
    });

    it("Pedidos: filtra por estado y actualiza un pedido", () => {
        iniciarSesionComo("vendedor");
        renderizarApp("/admin/pedidos");
        escribir("Filtrar pedidos por estado", "preparacion");
        expect(screen.getAllByRole("row").length).toBe(2); // encabezado + SV-0003

        escribir("Estado del pedido SV-0003", "despachado");
        escribir("Número de seguimiento del pedido SV-0003", "CHX-998877");
        clic("Guardar pedido SV-0003");

        expect(screen.getByText('Pedido SV-0003 actualizado a "Despachado".')).toBeTruthy();
        expect(pedidosServicio.obtenerTodos().find((p) => p.id === 3)?.seguimiento).toBe("CHX-998877");
    });

    it("Inventario: guarda el nuevo stock usando el servicio (spy)", () => {
        iniciarSesionComo("vendedor");
        const actualizarStock = spyOn(productosServicio, "actualizarStock").and.callThrough();
        renderizarApp("/admin/inventario");
        escribir("Buscar producto", "SM57");
        escribir("Stock de Micrófono Dinámico Instrumento", "15");
        clic("Guardar stock de Micrófono Dinámico Instrumento");
        expect(actualizarStock).toHaveBeenCalledWith("MI002", 15);
        expect(screen.getByText("Stock de MI002 actualizado a 15.")).toBeTruthy();
    });

    it("Inventario: el interruptor muestra solo productos con stock crítico", () => {
        iniciarSesionComo("administrador");
        renderizarApp("/admin/inventario");
        fireEvent.click(screen.getByLabelText("Mostrar solo stock crítico"));
        expect(screen.getAllByRole("row").length).toBe(12); // encabezado + 11 productos con stock 2
    });

    it("Productos: crea, edita y elimina un producto", () => {
        iniciarSesionComo("administrador");
        renderizarApp("/admin/productos");
        escribir("Código", "AC011");
        escribir("Categoría", "accesorios");
        escribir("Nombre", "Correa de Cuero");
        escribir("Marca", "Levy's");
        escribir("Modelo", "M17");
        escribir("Precio (CLP)", "24990");
        escribir("Stock", "6");
        escribir("Descripción breve", "Correa de cuero ajustable.");
        clic("Crear producto");
        expect(screen.getByText("Producto AC011 creado correctamente.")).toBeTruthy();

        const fila = screen.getByText("Correa de Cuero").closest("tr")!;
        fireEvent.click(within(fila).getByRole("button", { name: "Editar" }));
        escribir("Precio (CLP)", "21990");
        clic("Guardar cambios");
        expect(productosServicio.obtenerPorCodigo("AC011")?.precio).toBe(21990);

        fireEvent.click(within(screen.getByText("Correa de Cuero").closest("tr")!).getByRole("button", { name: "Eliminar" }));
        expect(productosServicio.obtenerPorCodigo("AC011")).toBeUndefined();
    });

    it("Productos: muestra error si el código ya existe", () => {
        iniciarSesionComo("administrador");
        renderizarApp("/admin/productos");
        escribir("Código", "GA001");
        escribir("Categoría", "guitarras-acusticas");
        escribir("Nombre", "Repetida");
        escribir("Marca", "X");
        escribir("Modelo", "Y");
        escribir("Precio (CLP)", "1000");
        escribir("Stock", "1");
        escribir("Descripción breve", "Producto repetido.");
        clic("Crear producto");
        expect(screen.getByText("Ya existe un producto con el código GA001.")).toBeTruthy();
    });

    it("Usuarios: crea un vendedor y desactiva una cuenta", () => {
        iniciarSesionComo("administrador");
        renderizarApp("/admin/usuarios");
        escribir("RUT", "20.111.333-4");
        escribir("Nombre completo", "Nuevo Vendedor");
        escribir("Correo electrónico", "nuevo@sonidovivo.cl");
        escribir("Contraseña", "Vende2026");
        escribir("Confirmar contraseña", "Vende2026");
        escribir("Rol", "vendedor");
        clic("Crear usuario");
        expect(screen.getByText("Usuario Nuevo Vendedor creado correctamente.")).toBeTruthy();

        const fila = screen.getByText("Cliente de Prueba").closest("tr")!;
        fireEvent.click(within(fila).getByRole("button", { name: "Desactivar" }));
        expect(usuariosServicio.obtenerPorId(3)?.activo).toBeFalse();
        expect(screen.getByText("Usuario Cliente de Prueba desactivado.")).toBeTruthy();
    });

    it("Usuarios: edita el rol de un usuario existente", () => {
        iniciarSesionComo("administrador");
        renderizarApp("/admin/usuarios");
        const fila = screen.getByText("Cliente de Prueba").closest("tr")!;
        fireEvent.click(within(fila).getByRole("button", { name: "Editar" }));
        expect(screen.getByRole("heading", { name: "Editar usuario" })).toBeTruthy();
        escribir("Rol", "vendedor");
        clic("Guardar cambios");
        expect(usuariosServicio.obtenerPorId(3)?.rol).toBe("vendedor");
    });

    it("Usuarios: el administrador no puede cambiar su propio rol", () => {
        iniciarSesionComo("administrador");
        renderizarApp("/admin/usuarios");
        const fila = screen.getByText("Dueño Sonido Vivo").closest("tr")!;
        fireEvent.click(within(fila).getByRole("button", { name: "Editar" }));
        escribir("Rol", "cliente");
        clic("Guardar cambios");
        expect(screen.getByText(/No puedes cambiar tu propio rol/)).toBeTruthy();
        expect(usuariosServicio.obtenerPorId(1)?.rol).toBe("administrador");
    });
});
