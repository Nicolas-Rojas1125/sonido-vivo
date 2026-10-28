import { useState } from "react";
import { puntosRetiro, tienda } from "../datos/tienda";
import Alerta from "../componentes/atomos/Alerta";
import FormularioContacto from "../componentes/organismos/FormularioContacto";
import Hero from "../componentes/organismos/Hero";
import MapaTiendas from "../componentes/organismos/MapaTiendas";

function Contacto() {
    const [confirmacion, setConfirmacion] = useState("");

    return (
        <>
            <Hero titulo="Contacto" texto="¿Dudas sobre stock, precios, despachos o reparaciones? Escríbenos." compacto />

            <div className="container py-4">
                <div className="row g-4">
                    <section className="col-12 col-lg-8" aria-labelledby="titulo-formulario">
                        <div className="card">
                            <div className="card-body p-4">
                                <h2 id="titulo-formulario" className="h4 mb-3">
                                    Envíanos un mensaje
                                </h2>
                                <Alerta texto={confirmacion} alCerrar={() => setConfirmacion("")} />
                                <FormularioContacto
                                    alEnviar={(datos) =>
                                        setConfirmacion(
                                            "¡Gracias, " + datos.nombre.trim() + "! Recibimos tu mensaje y te responderemos el mismo día."
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </section>
                    <aside className="col-12 col-lg-4">
                        <div className="card h-100">
                            <div className="card-body">
                                <h2 className="h5">Datos de la tienda</h2>
                                <ul className="list-unstyled mb-0">
                                    <li className="mb-2">📍 {tienda.direccion}</li>
                                    <li className="mb-2">📞 {tienda.telefono}</li>
                                    <li className="mb-2">💬 WhatsApp {tienda.whatsapp}</li>
                                    <li className="mb-2">✉️ {tienda.correo}</li>
                                    <li className="mb-2">📷 Instagram {tienda.instagram}</li>
                                    <li>🕒 {tienda.horario}</li>
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>

                <section className="mt-5" aria-labelledby="titulo-mapa">
                    <h2 id="titulo-mapa" className="h4 mb-3">
                        Tienda y puntos de retiro
                    </h2>
                    <MapaTiendas puntos={puntosRetiro} centro={tienda.coordenadas} />
                </section>
            </div>
        </>
    );
}
export default Contacto;
