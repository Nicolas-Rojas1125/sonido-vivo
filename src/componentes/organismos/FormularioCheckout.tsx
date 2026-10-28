import { useState } from "react";
import type { SubmitEvent } from "react";
import { puntosRetiro } from "../../datos/tienda";
import type { DatosCheckout, ErroresCheckout, TipoEntrega } from "../../tipos/Pedido";
import { tieneErrores, validarCheckout } from "../../utilidades/validaciones";
import Boton from "../atomos/Boton";
import CampoFormulario from "../moleculas/CampoFormulario";
import CampoSelector from "../moleculas/CampoSelector";

type Props = {
    nombreInicial: string;
    correoInicial: string;
    tipoEntrega: TipoEntrega;
    alCambiarEntrega: (tipo: TipoEntrega) => void; // el padre necesita saberlo para calcular el envío
    alConfirmar: (datos: DatosCheckout) => void;
    procesando?: boolean;
};

const opcionesRetiro = puntosRetiro.map((punto) => ({ valor: punto.id, etiqueta: punto.nombre + " – " + punto.direccion }));

function FormularioCheckout({ nombreInicial, correoInicial, tipoEntrega, alCambiarEntrega, alConfirmar, procesando = false }: Props) {
    const [datos, setDatos] = useState<Omit<DatosCheckout, "tipoEntrega">>({
        nombre: nombreInicial,
        correo: correoInicial,
        telefono: "",
        direccion: "",
        comuna: "",
        puntoRetiro: "",
        medioPago: "",
    });
    const [errores, setErrores] = useState<ErroresCheckout>({});

    const cambiar = (campo: keyof typeof datos) => (valor: string) => {
        setDatos({ ...datos, [campo]: valor });
    };

    const manejarEnvio = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const completos: DatosCheckout = { ...datos, tipoEntrega };
        const nuevosErrores = validarCheckout(completos);
        setErrores(nuevosErrores);
        if (!tieneErrores(nuevosErrores)) {
            alConfirmar(completos);
        }
    };

    return (
        <form onSubmit={manejarEnvio} noValidate aria-label="Datos de compra">
            <h2 className="h5">1. Tus datos</h2>
            <div className="row">
                <div className="col-12 col-md-6">
                    <CampoFormulario etiqueta="Nombre completo" tipo="text" nombre="nombre" valor={datos.nombre} alCambiar={cambiar("nombre")} error={errores.nombre} autoComplete="name" />
                </div>
                <div className="col-12 col-md-6">
                    <CampoFormulario etiqueta="Correo" tipo="email" nombre="correo" valor={datos.correo} alCambiar={cambiar("correo")} error={errores.correo} autoComplete="email" />
                </div>
                <div className="col-12 col-md-6">
                    <CampoFormulario etiqueta="Teléfono" tipo="tel" nombre="telefono" valor={datos.telefono} alCambiar={cambiar("telefono")} error={errores.telefono} placeholder="+56 9 1234 5678" autoComplete="tel" />
                </div>
            </div>

            <h2 className="h5 mt-2">2. Entrega</h2>
            <fieldset className="mb-3">
                <legend className="visually-hidden">Tipo de entrega</legend>
                <div className="btn-group w-100" role="group">
                    <input type="radio" className="btn-check" name="tipoEntrega" id="entrega-despacho" checked={tipoEntrega === "despacho"} onChange={() => alCambiarEntrega("despacho")} />
                    <label className="btn btn-outline-marca" htmlFor="entrega-despacho">
                        🚚 Despacho a domicilio
                    </label>
                    <input type="radio" className="btn-check" name="tipoEntrega" id="entrega-retiro" checked={tipoEntrega === "retiro"} onChange={() => alCambiarEntrega("retiro")} />
                    <label className="btn btn-outline-marca" htmlFor="entrega-retiro">
                        🏬 Retiro en tienda
                    </label>
                </div>
            </fieldset>

            {tipoEntrega === "despacho" ? (
                <div className="row">
                    <div className="col-12 col-md-8">
                        <CampoFormulario etiqueta="Dirección" tipo="text" nombre="direccion" valor={datos.direccion} alCambiar={cambiar("direccion")} error={errores.direccion} placeholder="Calle, número, depto." autoComplete="street-address" />
                    </div>
                    <div className="col-12 col-md-4">
                        <CampoFormulario etiqueta="Comuna" tipo="text" nombre="comuna" valor={datos.comuna} alCambiar={cambiar("comuna")} error={errores.comuna} />
                    </div>
                </div>
            ) : (
                <CampoSelector etiqueta="Punto de retiro" nombre="puntoRetiro" valor={datos.puntoRetiro} opciones={opcionesRetiro} alCambiar={cambiar("puntoRetiro")} error={errores.puntoRetiro} />
            )}

            <h2 className="h5 mt-2">3. Pago</h2>
            <CampoSelector
                etiqueta="Medio de pago"
                nombre="medioPago"
                valor={datos.medioPago}
                opciones={[
                    { valor: "webpay", etiqueta: "Webpay – débito o crédito (simulado)" },
                    { valor: "transferencia", etiqueta: "Transferencia bancaria" },
                ]}
                alCambiar={cambiar("medioPago")}
                error={errores.medioPago}
            />
            <Boton texto={procesando ? "Procesando..." : "Confirmar pedido"} tipo="submit" tamano="lg" anchoCompleto deshabilitado={procesando} />
        </form>
    );
}
export default FormularioCheckout;
