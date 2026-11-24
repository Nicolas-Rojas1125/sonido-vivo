import { Route, Routes } from "react-router-dom";
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
import AdminContactos from "./paginas/admin/AdminContactos";
import AdminInventario from "./paginas/admin/AdminInventario";
import AdminPedidos from "./paginas/admin/AdminPedidos";
import AdminProductos from "./paginas/admin/AdminProductos";
import AdminUsuarios from "./paginas/admin/AdminUsuarios";
import LayoutAdmin from "./paginas/admin/LayoutAdmin";
import PanelResumen from "./paginas/admin/PanelResumen";

// Acceso por tipo de usuario (como una tienda online convencional):
//  - INVITADO (sin cuenta): navega la tienda, arma su carrito y escribe por contacto.
//  - Para COMPRAR debe registrarse o iniciar sesión como Cliente (el carrito no se pierde).
//  - El Panel es solo para Administrador y Vendedor.
function App() {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Encabezado />
            <main className="flex-grow-1">
                <Routes>
                    {/* Públicas: cualquier visitante, con o sin cuenta (invitado) */}
                    <Route path="/" element={<Inicio />} />
                    <Route path="/productos" element={<Productos />} />
                    <Route path="/productos/:codigo" element={<DetalleProducto />} />
                    <Route path="/carrito" element={<Carrito />} />
                    <Route path="/nosotros" element={<Nosotros />} />
                    <Route path="/contacto" element={<Contacto />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />

                    {/* Rol Cliente: el invitado que llega aquí es enviado a iniciar sesión o registrarse */}
                    <Route path="/checkout" element={<RutaProtegida roles={["cliente"]}><Checkout /></RutaProtegida>} />
                    <Route path="/mis-pedidos" element={<RutaProtegida roles={["cliente"]}><MisPedidos /></RutaProtegida>} />

                    {/* Panel: Administrador y Vendedor (algunas secciones solo Administrador) */}
                    <Route path="/admin" element={<RutaProtegida roles={["administrador", "vendedor"]}><LayoutAdmin /></RutaProtegida>}>
                        <Route index element={<PanelResumen />} />
                        <Route path="pedidos" element={<AdminPedidos />} />
                        <Route path="inventario" element={<AdminInventario />} />
                        <Route path="contactos" element={<AdminContactos />} />
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
