import { useState } from "react";
import type { SubmitEvent } from "react";
import { asuntosContacto } from "../../datos/contacto";
import type { DatosContacto, ErroresContacto } from "../../tipos/Contacto";
import { tieneErrores, validarContacto } from "../../utilidades/validaciones";
import Boton from "../atomos/Boton";
import CampoAreaTexto from "../moleculas/CampoAreaTexto";
import CampoFormulario from "../moleculas/CampoFormulario";
import CampoSelector from "../moleculas/CampoSelector";

type Props = {
    // Puede ser síncrona o asíncrona (async, cuando envía los datos al backend).
    // Si devuelve false, el envío falló y el formulario NO se limpia (el cliente no pierde lo que escribió).
    alEnviar: (datos: DatosContacto) => void | boolean | Promise<void | boolean>;
};

const datosVacios: DatosContacto = { nombre: "", correo: "", telefono: "", asunto: "", mensaje: "" };

function FormularioContacto({ alEnviar }: Props) {
    const [datos, setDatos] = useState<DatosContacto>(datosVacios);
    const [errores, setErrores] = useState<ErroresContacto>({});
    // Permite indicar que el mensaje se está enviando (deshabilita el botón)
    const [enviando, setEnviando] = useState(false);

    const cambiar = (campo: keyof DatosContacto) => (valor: string) => {
        setDatos({ ...datos, [campo]: valor });
    };

    const manejarEnvio = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault(); // Evita recargar la página

        // Evita otro envío mientras la petición está en curso
        if (enviando) {
            return;
        }

        const nuevosErrores = validarContacto(datos);
        setErrores(nuevosErrores);

        if (tieneErrores(nuevosErrores)) {
            return;
        }

        // Comienza el envío
        setEnviando(true);
        try {
            const resultado = await alEnviar(datos);
            // Limpia los campos solo si se guardó correctamente
            if (resultado !== false) {
                setDatos(datosVacios);
            }
        } finally {
            // Finaliza el envío y habilita nuevamente el botón
            setEnviando(false);
        }
    };

    return (
        <form onSubmit={manejarEnvio} noValidate aria-label="Formulario de contacto">
            <div className="row">
                <div className="col-12 col-md-6">
                    <CampoFormulario
                        etiqueta="Nombre completo"
                        tipo="text"
                        nombre="nombre"
                        valor={datos.nombre}
                        alCambiar={cambiar("nombre")}
                        error={errores.nombre}
                        placeholder="Ej: Camila Soto"
                        autoComplete="name"
                    />
                </div>
                <div className="col-12 col-md-6">
                    <CampoFormulario
                        etiqueta="Correo electrónico"
                        tipo="email"
                        nombre="correo"
                        valor={datos.correo}
                        alCambiar={cambiar("correo")}
                        error={errores.correo}
                        placeholder="Ej: camila@correo.cl"
                        autoComplete="email"
                    />
                </div>
                <div className="col-12 col-md-6">
                    <CampoFormulario
                        etiqueta="Teléfono (opcional)"
                        tipo="tel"
                        nombre="telefono"
                        valor={datos.telefono}
                        alCambiar={cambiar("telefono")}
                        error={errores.telefono}
                        placeholder="Ej: +56 9 1234 5678"
                        autoComplete="tel"
                    />
                </div>
                <div className="col-12 col-md-6">
                    <CampoSelector
                        etiqueta="Asunto"
                        nombre="asunto"
                        valor={datos.asunto}
                        opciones={asuntosContacto}
                        alCambiar={cambiar("asunto")}
                        error={errores.asunto}
                    />
                </div>
            </div>
            <CampoAreaTexto
                etiqueta="Mensaje"
                nombre="mensaje"
                valor={datos.mensaje}
                alCambiar={cambiar("mensaje")}
                error={errores.mensaje}
                placeholder="Cuéntanos qué instrumento buscas o en qué te podemos ayudar..."
            />
            <Boton texto={enviando ? "Enviando..." : "Enviar mensaje"} tipo="submit" deshabilitado={enviando} />
        </form>
    );
}
export default FormularioContacto;
