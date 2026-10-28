import { categorias } from "../datos/categorias";
import { puntosRetiro } from "../datos/tienda";
import type { DatosContacto, ErroresContacto } from "../tipos/Contacto";
import type { DatosCheckout, ErroresCheckout } from "../tipos/Pedido";
import type { Categoria, ErroresProducto, FormularioProductoDatos } from "../tipos/Producto";
import type { DatosLogin, ErroresLogin, ErroresUsuario, FormularioUsuarioDatos, Rol } from "../tipos/Usuario";

const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexTelefono = /^\+?[0-9 ]{8,15}$/;
const regexEntero = /^[0-9]+$/;
const regexCodigo = /^[A-Z]{2}[0-9]{3}$/;
// Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
const regexClave = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;

export function tieneErrores(errores: object): boolean {
    return Object.keys(errores).length > 0;
}

export function esCategoria(valor: string): valor is Categoria {
    return categorias.some((categoria) => categoria.valor === valor);
}

export function esRol(valor: string): valor is Rol {
    return valor === "administrador" || valor === "vendedor" || valor === "cliente";
}

export function esCorreoValido(correo: string): boolean {
    return regexCorreo.test(correo.trim());
}

// ---------------------------------------------------------------------
// RUT chileno: valida el dígito verificador con el algoritmo módulo 11
// Acepta "12.345.678-5", "12345678-5" o "123456785"
// ---------------------------------------------------------------------
export function limpiarRut(rut: string): string {
    return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

export function calcularDigitoVerificador(cuerpo: string): string {
    let suma = 0;
    let multiplicador = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    const resto = 11 - (suma % 11);
    if (resto === 11) return "0";
    if (resto === 10) return "K";
    return String(resto);
}

export function validarRut(rut: string): boolean {
    const limpio = limpiarRut(rut);
    if (limpio.length < 8 || limpio.length > 9) {
        return false;
    }
    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);
    if (!/^[0-9]+$/.test(cuerpo)) {
        return false;
    }
    return calcularDigitoVerificador(cuerpo) === dv;
}

// "123456785" -> "12.345.678-5"
export function formatearRut(rut: string): string {
    const limpio = limpiarRut(rut);
    if (limpio.length < 2) {
        return rut;
    }
    const cuerpo = limpio.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return cuerpo + "-" + limpio.slice(-1);
}

// ---------------------------------------------------------------------
// Formularios
// ---------------------------------------------------------------------
export function validarContacto(datos: DatosContacto): ErroresContacto {
    const errores: ErroresContacto = {};

    if (datos.nombre.trim().length < 3) {
        errores.nombre = "Ingresa un nombre de al menos 3 caracteres.";
    }
    if (!esCorreoValido(datos.correo)) {
        errores.correo = "Ingresa un correo electrónico válido.";
    }
    if (datos.telefono.trim() !== "" && !regexTelefono.test(datos.telefono.trim())) {
        errores.telefono = "Ingresa un teléfono válido, por ejemplo +56 9 1234 5678.";
    }
    if (datos.asunto === "") {
        errores.asunto = "Selecciona un asunto.";
    }
    if (datos.mensaje.trim().length < 10) {
        errores.mensaje = "Tu mensaje debe tener al menos 10 caracteres.";
    }

    return errores;
}

export function validarLogin(datos: DatosLogin): ErroresLogin {
    const errores: ErroresLogin = {};
    if (!esCorreoValido(datos.correo)) {
        errores.correo = "Ingresa un correo electrónico válido.";
    }
    if (datos.clave === "") {
        errores.clave = "Ingresa tu contraseña.";
    }
    return errores;
}

// esEdicion = true: la contraseña es opcional (si se deja vacía, se mantiene la actual)
export function validarUsuario(datos: FormularioUsuarioDatos, esEdicion = false): ErroresUsuario {
    const errores: ErroresUsuario = {};

    if (!validarRut(datos.rut)) {
        errores.rut = "Ingresa un RUT válido, por ejemplo 12.345.678-5.";
    }
    if (datos.nombre.trim().length < 3) {
        errores.nombre = "Ingresa un nombre de al menos 3 caracteres.";
    }
    if (!esCorreoValido(datos.correo)) {
        errores.correo = "Ingresa un correo electrónico válido.";
    }

    const debeValidarClave = !esEdicion || datos.clave !== "";
    if (debeValidarClave) {
        if (!regexClave.test(datos.clave)) {
            errores.clave = "Mínimo 8 caracteres, con mayúscula, minúscula y número.";
        } else if (datos.clave !== datos.confirmarClave) {
            errores.confirmarClave = "Las contraseñas no coinciden.";
        }
    }

    if (!esRol(datos.rol)) {
        errores.rol = "Selecciona un rol.";
    }

    return errores;
}

export function validarProducto(datos: FormularioProductoDatos): ErroresProducto {
    const errores: ErroresProducto = {};

    if (!regexCodigo.test(datos.codigo.trim())) {
        errores.codigo = "El código debe tener 2 letras mayúsculas y 3 números. Ej: GA006.";
    }
    if (!esCategoria(datos.categoria)) {
        errores.categoria = "Selecciona una categoría.";
    }
    if (datos.nombre.trim().length < 3) {
        errores.nombre = "Ingresa un nombre de al menos 3 caracteres.";
    }
    if (datos.marca.trim() === "") {
        errores.marca = "Ingresa la marca del producto.";
    }
    if (datos.modelo.trim() === "") {
        errores.modelo = "Ingresa el modelo del producto.";
    }
    if (!regexEntero.test(datos.stock.trim())) {
        errores.stock = "El stock debe ser un número entero mayor o igual a 0.";
    }
    if (datos.precio.trim() === "") {
        errores.precio = "Ingresa el precio del producto.";
    } else if (!regexEntero.test(datos.precio.trim()) || Number(datos.precio) <= 0) {
        errores.precio = "El precio debe ser un número entero mayor a 0.";
    }
    if (datos.descripcion.trim().length < 10) {
        errores.descripcion = "La descripción debe tener al menos 10 caracteres.";
    }

    return errores;
}

export function validarCheckout(datos: DatosCheckout): ErroresCheckout {
    const errores: ErroresCheckout = {};

    if (datos.nombre.trim().length < 3) {
        errores.nombre = "Ingresa tu nombre completo.";
    }
    if (!esCorreoValido(datos.correo)) {
        errores.correo = "Ingresa un correo electrónico válido.";
    }
    if (!regexTelefono.test(datos.telefono.trim())) {
        errores.telefono = "Ingresa un teléfono válido, por ejemplo +56 9 1234 5678.";
    }

    if (datos.tipoEntrega === "despacho") {
        if (datos.direccion.trim().length < 5) {
            errores.direccion = "Ingresa la dirección de despacho.";
        }
        if (datos.comuna.trim().length < 3) {
            errores.comuna = "Ingresa la comuna.";
        }
    } else if (datos.tipoEntrega === "retiro") {
        if (!puntosRetiro.some((punto) => punto.id === datos.puntoRetiro)) {
            errores.puntoRetiro = "Selecciona un punto de retiro.";
        }
    } else {
        errores.tipoEntrega = "Selecciona despacho o retiro en tienda.";
    }

    if (datos.medioPago !== "transferencia" && datos.medioPago !== "webpay") {
        errores.medioPago = "Selecciona un medio de pago.";
    }

    return errores;
}
