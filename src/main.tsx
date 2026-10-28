import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import "./index.css";
import App from "./App.tsx";
import CarritoProveedor from "./contexto/CarritoProveedor";
import SesionProveedor from "./contexto/SesionProveedor";

// Los "proveedores" entregan el estado global (sesión y carrito) a toda la aplicación
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <SesionProveedor>
                <CarritoProveedor>
                    <App />
                </CarritoProveedor>
            </SesionProveedor>
        </BrowserRouter>
    </StrictMode>
);
