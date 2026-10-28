import { useState } from "react";
import type { SubmitEvent } from "react";
import type { DatosContacto, ErroresContacto } from "../../tipos/Contacto";
import { tieneErrores, validarContacto } from "../../utilidades/validaciones";
import Boton from "../atomos/Boton";
import CampoAreaTexto from "../moleculas/CampoAreaTexto";
import CampoFormulario from "../moleculas/CampoFormulario";
import CampoSelector from "../moleculas/CampoSelector";

type Props = {
    alEnviar: (datos: DatosContacto) => void;
};

const datosVacios: DatosContacto = { nombre: "", correo: "", telefono: "", asunto: "", mensaje: "" };

const asuntos = [
    { valor: "stock", etiqueta: "Consulta de stock o precio" },
    { valor: "pedido", etiqueta: "Estado de mi pedido" },
    { valor: "reparacion", etiqueta: "Reparación de instrumento" },
    { valor: "otro", etiqueta: "Otro" },
];

function FormularioContacto({ alEnviar }: Props) {
    const [datos, setDatos] = useState<DatosContacto>(datosVacios);
    const [errores, setErrores] = useState<ErroresContacto>({});

    const cambiar = (campo: keyof DatosContacto) => (valor: string) => {
        setDatos({ ...datos, [campo]: valor });
    };

    const manejarEnvio = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const nuevosErrores = validarContacto(datos);
        setErrores(nuevosErrores);

        if (tieneErrores(nuevosErrores)) {
            return;
        }

        alEnviar(datos);
        setDatos(datosVacios);
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
                        opciones={asuntos}
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
            <Boton texto="Enviar mensaje" tipo="submit" />
        </form>
    );
}
export default FormularioContacto;
