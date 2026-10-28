import { tienda } from "../../datos/tienda";
import Navbar from "./Navbar";

function Encabezado() {
    return (
        <header className="encabezado sticky-top">
            <div className="franja-superior d-none d-md-block">
                <div className="container d-flex justify-content-between small">
                    <span>📍 {tienda.direccion}</span>
                    <span>
                        WhatsApp {tienda.whatsapp} · Instagram {tienda.instagram}
                    </span>
                </div>
            </div>
            <Navbar />
        </header>
    );
}
export default Encabezado;
