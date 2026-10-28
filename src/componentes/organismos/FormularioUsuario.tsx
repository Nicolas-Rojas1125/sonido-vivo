import { useState } from "react";
import type { SubmitEvent } from "react";
import { etiquetasRol } from "../../datos/usuarios";
import type { DatosNuevoUsuario } from "../../servicios/usuariosServicio";
import type { ErroresUsuario, FormularioUsuarioDatos, UsuarioSesion } from "../../tipos/Usuario";
import { esRol, formatearRut, tieneErrores, validarUsuario } from "../../utilidades/validaciones";
import Boton from "../atomos/Boton";
import CampoFormulario from "../moleculas/CampoFormulario";
import CampoSelector from "../moleculas/CampoSelector";

type Props = {
    // modo "registro": formulario público (sin selector de rol, siempre Cliente)
    // modo "admin": el administrador elige el rol
    modo: "registro" | "admin";
    usuarioInicial?: UsuarioSesion; // si viene, el formulario está en modo edición
    textoBoton?: string;
    alGuardar: (datos: DatosNuevoUsuario) => void;
    alCancelar?: () => void;
};

const opcionesRol = Object.entries(etiquetasRol).map(([valor, etiqueta]) => ({ valor, etiqueta }));

function FormularioUsuario({ modo, usuarioInicial, textoBoton, alGuardar, alCancelar }: Props) {
    const esEdicion = usuarioInicial !== undefined;

    const [datos, setDatos] = useState<FormularioUsuarioDatos>({
        rut: usuarioInicial?.rut ?? "",
        nombre: usuarioInicial?.nombre ?? "",
        correo: usuarioInicial?.correo ?? "",
        clave: "",
        confirmarClave: "",
        rol: usuarioInicial?.rol ?? (modo === "registro" ? "cliente" : ""),
    });
    const [errores, setErrores] = useState<ErroresUsuario>({});

    const cambiar = (campo: keyof FormularioUsuarioDatos) => (valor: string) => {
        setDatos({ ...datos, [campo]: valor });
    };

    const manejarEnvio = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const nuevosErrores = validarUsuario(datos, esEdicion);
        setErrores(nuevosErrores);

        if (tieneErrores(nuevosErrores) || !esRol(datos.rol)) {
            return;
        }

        alGuardar({
            rut: formatearRut(datos.rut),
            nombre: datos.nombre.trim(),
            correo: datos.correo.trim(),
            clave: datos.clave,
            rol: datos.rol,
        });
    };

    return (
        <form onSubmit={manejarEnvio} noValidate aria-label="Formulario de usuario">
            <CampoFormulario
                etiqueta="RUT"
                tipo="text"
                nombre="rut"
                valor={datos.rut}
                alCambiar={cambiar("rut")}
                error={errores.rut}
                placeholder="Ej: 12.345.678-5"
            />
            <CampoFormulario
                etiqueta="Nombre completo"
                tipo="text"
                nombre="nombre"
                valor={datos.nombre}
                alCambiar={cambiar("nombre")}
                error={errores.nombre}
                autoComplete="name"
            />
            <CampoFormulario
                etiqueta="Correo electrónico"
                tipo="email"
                nombre="correo"
                valor={datos.correo}
                alCambiar={cambiar("correo")}
                error={errores.correo}
                autoComplete="email"
            />
            <div className="row">
                <div className="col-12 col-sm-6">
                    <CampoFormulario
                        etiqueta={esEdicion ? "Nueva contraseña (opcional)" : "Contraseña"}
                        tipo="password"
                        nombre="clave"
                        valor={datos.clave}
                        alCambiar={cambiar("clave")}
                        error={errores.clave}
                        ayuda="Mínimo 8 caracteres, con mayúscula, minúscula y número."
                        autoComplete="new-password"
                    />
                </div>
                <div className="col-12 col-sm-6">
                    <CampoFormulario
                        etiqueta="Confirmar contraseña"
                        tipo="password"
                        nombre="confirmarClave"
                        valor={datos.confirmarClave}
                        alCambiar={cambiar("confirmarClave")}
                        error={errores.confirmarClave}
                        autoComplete="new-password"
                    />
                </div>
            </div>
            {modo === "admin" && (
                <CampoSelector
                    etiqueta="Rol"
                    nombre="rol"
                    valor={datos.rol}
                    opciones={opcionesRol}
                    alCambiar={cambiar("rol")}
                    error={errores.rol}
                />
            )}
            <div className="d-flex flex-wrap gap-2">
                <Boton texto={textoBoton ?? (esEdicion ? "Guardar cambios" : "Crear usuario")} tipo="submit" />
                {alCancelar && <Boton texto="Cancelar" variante="outline-secondary" alClick={alCancelar} />}
            </div>
        </form>
    );
}
export default FormularioUsuario;
