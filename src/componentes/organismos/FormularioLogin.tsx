import { useState } from "react";
import type { SubmitEvent } from "react";
import type { DatosLogin, ErroresLogin } from "../../tipos/Usuario";
import { tieneErrores, validarLogin } from "../../utilidades/validaciones";
import Boton from "../atomos/Boton";
import CampoFormulario from "../moleculas/CampoFormulario";

type Props = {
    alIngresar: (datos: DatosLogin) => void;
};

function FormularioLogin({ alIngresar }: Props) {
    const [datos, setDatos] = useState<DatosLogin>({ correo: "", clave: "" });
    const [errores, setErrores] = useState<ErroresLogin>({});

    const manejarEnvio = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const nuevosErrores = validarLogin(datos);
        setErrores(nuevosErrores);
        if (!tieneErrores(nuevosErrores)) {
            alIngresar(datos);
        }
    };

    return (
        <form onSubmit={manejarEnvio} noValidate aria-label="Formulario de inicio de sesión">
            <CampoFormulario
                etiqueta="Correo electrónico"
                tipo="email"
                nombre="correo"
                valor={datos.correo}
                alCambiar={(correo) => setDatos({ ...datos, correo })}
                error={errores.correo}
                autoComplete="email"
            />
            <CampoFormulario
                etiqueta="Contraseña"
                tipo="password"
                nombre="clave"
                valor={datos.clave}
                alCambiar={(clave) => setDatos({ ...datos, clave })}
                error={errores.clave}
                autoComplete="current-password"
            />
            <Boton texto="Ingresar" tipo="submit" anchoCompleto />
        </form>
    );
}
export default FormularioLogin;
