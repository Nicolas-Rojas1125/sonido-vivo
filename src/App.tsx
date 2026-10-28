import type { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import { CATALOGO_PUBLICO } from "./datos/tienda";
import { todosLosRoles } from "./datos/usuarios";
import Encabezado from "./componentes/organismos/Encabezado";
import Footer from "./componentes/organismos/Footer";
import RutaProtegida from "./componentes/organismos/RutaProtegida";
import Carrito from "./paginas/Carrito";
import Checkout from "./paginas/Checkout";
import Contacto from "./paginas/Contacto";
import DetalleProducto from "./paginas/DetalleProducto";
import Inicio from "./paginas/Inicio";
import Login from "./paginas/Login";
import MisPedidos from "./paginas/MisPedidos";
import NoEncontrada from "./paginas/NoEncontrada";
import Nosotros from "./paginas/Nosotros";
import Productos from "./paginas/Productos";
import Registro from "./paginas/Registro";
import AdminInventario from "./paginas/admin/AdminInventario";
import AdminPedidos from "./paginas/admin/AdminPedidos";
import AdminProductos from "./paginas/admin/AdminProductos";
import AdminUsuarios from "./paginas/admin/AdminUsuarios";
import LayoutAdmin from "./paginas/admin/LayoutAdmin";
import PanelResumen from "./paginas/admin/PanelResumen";

// Regla de seguridad del caso: las vistas de la tienda exigen sesión iniciada (cualquier rol),
// salvo que CATALOGO_PUBLICO esté en true (src/datos/tienda.ts)
function conSesion(pagina: ReactElement): ReactElement {
    return CATALOGO_PUBLICO ? pagina : <RutaProtegida roles={todosLosRoles}>{pagina}</RutaProtegida>;
}

function App() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Encabezado />
            <main className="flex-grow-1">
                <Routes>
                    {/* Únicas vistas sin sesión: inicio de sesión y registro público */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />

                    {/* Tienda: cualquier usuario con sesión iniciada */}
                    <Route path="/" element={conSesion(<Inicio />)} />
                    <Route path="/productos" element={conSesion(<Productos />)} />
                    <Route path="/productos/:codigo" element={conSesion(<DetalleProducto />)} />
                    <Route path="/carrito" element={conSesion(<Carrito />)} />
                    <Route path="/nosotros" element={conSesion(<Nosotros />)} />
                    <Route path="/contacto" element={conSesion(<Contacto />)} />

                    {/* Rol Cliente */}
                    <Route path="/checkout" element={<RutaProtegida roles={["cliente"]}><Checkout /></RutaProtegida>} />
                    <Route path="/mis-pedidos" element={<RutaProtegida roles={["cliente"]}><MisPedidos /></RutaProtegida>} />

                    {/* Panel: Administrador y Vendedor (algunas secciones solo Administrador) */}
                    <Route path="/admin" element={<RutaProtegida roles={["administrador", "vendedor"]}><LayoutAdmin /></RutaProtegida>}>
                        <Route index element={<PanelResumen />} />
                        <Route path="pedidos" element={<AdminPedidos />} />
                        <Route path="inventario" element={<AdminInventario />} />
                        <Route path="productos" element={<RutaProtegida roles={["administrador"]}><AdminProductos /></RutaProtegida>} />
                        <Route path="usuarios" element={<RutaProtegida roles={["administrador"]}><AdminUsuarios /></RutaProtegida>} />
                    </Route>

                    <Route path="*" element={<NoEncontrada />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}
export default App;
