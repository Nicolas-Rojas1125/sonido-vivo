import type { DatosCheckout } from "../tipos/Pedido";
import type { FormularioProductoDatos } from "../tipos/Producto";
import type { FormularioUsuarioDatos } from "../tipos/Usuario";
import {
    calcularDigitoVerificador,
    formatearRut,
    validarCheckout,
    validarContacto,
    validarLogin,
    validarProducto,
    validarRut,
    validarUsuario,
} from "./validaciones";

describe("Validaciones", () => {
    describe("RUT chileno", () => {
        it("acepta RUT válidos con o sin puntos y guion", () => {
            expect(validarRut("12.345.678-5")).toBeTrue();
            expect(validarRut("123456785")).toBeTrue();
            expect(validarRut("9.876.543-3")).toBeTrue();
        });

        it("rechaza un RUT con dígito verificador incorrecto o con letras", () => {
            expect(validarRut("12.345.678-9")).toBeFalse();
            expect(validarRut("12.3A5.678-5")).toBeFalse();
            expect(validarRut("123")).toBeFalse();
        });

        it("calcula el dígito verificador K y 0", () => {
            expect(calcularDigitoVerificador("10000013")).toBe("K");
            expect(validarRut("10.000.013-k")).toBeTrue();
            expect(calcularDigitoVerificador("10000004")).toBe("0");
        });

        it("formatea el RUT con puntos y guion", () => {
            expect(formatearRut("123456785")).toBe("12.345.678-5");
        });
    });

    describe("Formulario de contacto", () => {
        it("devuelve un error por cada campo inválido", () => {
            const errores = validarContacto({ nombre: "A", correo: "malo", telefono: "abc", asunto: "", mensaje: "corto" });
            expect(Object.keys(errores).sort()).toEqual(["asunto", "correo", "mensaje", "nombre", "telefono"]);
        });

        it("no devuelve errores con datos válidos y teléfono vacío (es opcional)", () => {
            const errores = validarContacto({
                nombre: "Camila Soto",
                correo: "camila@correo.cl",
                telefono: "",
                asunto: "stock",
                mensaje: "¿Tienen la guitarra Yamaha F310?",
            });
            expect(errores).toEqual({});
        });
    });

    describe("Login", () => {
        it("exige correo válido y contraseña", () => {
            expect(validarLogin({ correo: "", clave: "" })).toEqual({
                correo: "Ingresa un correo electrónico válido.",
                clave: "Ingresa tu contraseña.",
            });
            expect(validarLogin({ correo: "a@b.cl", clave: "x" })).toEqual({});
        });
    });

    describe("Usuario", () => {
        const valido: FormularioUsuarioDatos = {
            rut: "12.345.678-5",
            nombre: "Pedro Rojas",
            correo: "pedro@correo.cl",
            clave: "Clave1234",
            confirmarClave: "Clave1234",
            rol: "cliente",
        };

        it("acepta un usuario válido", () => {
            expect(validarUsuario(valido)).toEqual({});
        });

        it("rechaza contraseñas débiles y contraseñas que no coinciden", () => {
            expect(validarUsuario({ ...valido, clave: "abc", confirmarClave: "abc" }).clave).toBeDefined();
            expect(validarUsuario({ ...valido, confirmarClave: "Otra1234" }).confirmarClave).toBe("Las contraseñas no coinciden.");
        });

        it("en edición permite dejar la contraseña vacía", () => {
            expect(validarUsuario({ ...valido, clave: "", confirmarClave: "" }, true)).toEqual({});
            expect(validarUsuario({ ...valido, clave: "", confirmarClave: "" }, false).clave).toBeDefined();
        });

        it("rechaza un rol inexistente", () => {
            expect(validarUsuario({ ...valido, rol: "superusuario" }).rol).toBe("Selecciona un rol.");
        });
    });

    describe("Producto", () => {
        const valido: FormularioProductoDatos = {
            codigo: "GA006",
            categoria: "guitarras-acusticas",
            nombre: "Guitarra de prueba",
            marca: "Yamaha",
            modelo: "FG800",
            stock: "3",
            precio: "199990",
            descripcion: "Tapa sólida de abeto.",
        };

        it("acepta un producto válido", () => {
            expect(validarProducto(valido)).toEqual({});
        });

        it("valida formato de código, precio positivo y stock entero", () => {
            const errores = validarProducto({ ...valido, codigo: "g6", precio: "0", stock: "-1" });
            expect(errores.codigo).toBeDefined();
            expect(errores.precio).toBe("El precio debe ser un número entero mayor a 0.");
            expect(errores.stock).toBeDefined();
        });
    });

    describe("Checkout", () => {
        const base: DatosCheckout = {
            nombre: "Cliente de Prueba",
            correo: "cliente@correo.cl",
            telefono: "+56 9 1234 5678",
            tipoEntrega: "despacho",
            direccion: "Av. Libertad 100",
            comuna: "Viña del Mar",
            puntoRetiro: "",
            medioPago: "webpay",
        };

        it("con despacho exige dirección y comuna", () => {
            expect(validarCheckout(base)).toEqual({});
            const errores = validarCheckout({ ...base, direccion: "", comuna: "" });
            expect(errores.direccion).toBeDefined();
            expect(errores.comuna).toBeDefined();
        });

        it("con retiro exige un punto de retiro existente y no pide dirección", () => {
            const retiro = { ...base, tipoEntrega: "retiro", direccion: "", comuna: "" };
            expect(validarCheckout({ ...retiro, puntoRetiro: "inventado" }).puntoRetiro).toBeDefined();
            expect(validarCheckout({ ...retiro, puntoRetiro: "las-condes" })).toEqual({});
        });

        it("exige medio de pago", () => {
            expect(validarCheckout({ ...base, medioPago: "" }).medioPago).toBe("Selecciona un medio de pago.");
        });
    });
});
