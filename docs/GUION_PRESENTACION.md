# Guion para la presentación individual (Situación evaluativa 2 – 60 %)

Antes de presentar: `npm install`, `npm test` (deja generado `coverage/index.html`) y `npm run dev`. Ten abiertos VS Code, la app en Chrome, la terminal y el reporte de cobertura.

---

## IE2.1.3 (15 %) – Cómo se diseñó el proyecto con un framework JS
**Muestra:** `package.json`, `main.tsx`, `App.tsx` y el árbol de carpetas.
**Di:**
- "Es una SPA en **React** con **TypeScript**, creada con **Vite**. La página no se recarga: React Router cambia el componente según la URL."
- "`main.tsx` monta la app dentro de `BrowserRouter` y de dos **proveedores de contexto**: la sesión y el carrito."
- "En `App.tsx` están las rutas: públicas solo `/login` y `/registro` (regla de seguridad del caso); la tienda exige sesión; `/checkout` y `/mis-pedidos` solo Cliente; `/admin` usa **rutas anidadas** con `<Outlet />`, y productos y usuarios son solo para el Administrador."
- "Separé responsabilidades: **componentes** (interfaz), **servicios** (datos, simulan la API REST de la EP3), **contexto** (estado global), **utilidades** (lógica pura, fácil de probar) y **tipos**."

## IE2.1.4 (20 %) – Componentes, props, estado y Bootstrap
**Muestra (en este orden):**
1. **Diseño atómico:** `Boton` (átomo) → `CampoFormulario` (molécula = label + Input + MensajeError) → `FormularioContacto` (organismo) → `Contacto` (página).
2. **Props:** `CardProducto` recibe `producto` (dato) y `alAgregar` (función). "El hijo no sabe qué hace el padre con el producto; solo lo avisa."
3. **Estado local:** `Navbar` (`abierto` del menú hamburguesa), `Carrusel` (`indice`), formularios controlados (`datos` y `errores` con `useState`).
4. **Levantar el estado:** `FormularioCheckout` avisa con `alCambiarEntrega` → `Checkout` guarda `tipoEntrega` y recalcula el envío en `ResumenCompra`. Demuéstralo cambiando "Despacho" ↔ "Retiro": el total cambia.
5. **Estado global:** `CarritoProveedor` + hook `useCarrito()`. Agrega un producto y muestra cómo cambia el número del carrito en el Navbar (otro componente). El carrito se guarda con `useEffect` y sobrevive a recargar la página.
6. **Validaciones:** `utilidades/validaciones.ts` → RUT con dígito verificador (módulo 11), contraseña segura, checkout que pide dirección o punto de retiro según la entrega.
7. **Bootstrap responsivo:** abre DevTools (Ctrl+Shift+M) y muestra 360, 768 y 1280 px:
   - `navbar-expand-lg` → menú hamburguesa en móvil.
   - `row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4` → 1, 2, 3 o 4 productos por fila.
   - `table-responsive` y `d-none d-md-table-cell` → columnas que se ocultan en móvil en las tablas del panel.
   - `col-12 col-md-6` en formularios; menú del panel lateral en escritorio y en pestañas en móvil.

**Demo de roles (2 min):** login Cliente → compra con retiro → "Mis pedidos" → cerrar sesión → login Vendedor → marcar el pedido "Despachado" con N° de seguimiento → actualizar stock → intentar entrar a `/admin/usuarios` (Acceso denegado) → login Administrador → crear usuario y desactivar otro.

## IE2.2.2 (15 %) – Pruebas con Jasmine y Karma
**Muestra:** `npm test` en la terminal (lista de pruebas con ✓) y abre 3 pruebas:
1. **Lógica pura:** `utilidades/validaciones.spec.ts` → "acepta RUT válidos…". Explica `describe` (grupo), `it` (caso) y `expect(...).toBeTrue()`.
2. **Comportamiento + DOM:** `atomos.spec.tsx` → "no ejecuta alClick cuando está deshabilitado": se renderiza, se hace `fireEvent.click` y se verifica que el botón tiene `disabled` y que el spy **no** fue llamado.
3. **Flujo completo:** `paginas.spec.tsx` → "un cliente confirma el pedido…": llena el formulario, confirma, y verifica que aparece "Mis pedidos", que el stock bajó a 0 y que el carrito quedó en 0.

**Di:** "Son 144 pruebas en 12 archivos: lógica (validaciones, carrito, servicios), componentes (props, eventos, clases de Bootstrap, elementos que aparecen y desaparecen) y páginas completas con navegación y permisos por rol."

## IE2.3.2 (10 %) – Proceso de testeo
1. **Configuración del entorno:** `karma.conf.cjs`
   - `frameworks: ["jasmine", "webpack"]` → Jasmine escribe las pruebas, Karma las ejecuta en Chrome.
   - Webpack + Babel compilan TypeScript/JSX para el navegador.
   - `babel-plugin-istanbul` + `karma-coverage` miden la cobertura; `check` define mínimos (80 %) que hacen fallar `npm test` si no se cumplen.
   - `src/test/indice-pruebas.ts` carga todos los `.spec`.
2. **Escritura:** patrón Preparar → Actuar → Verificar; `beforeEach(reiniciarDatos)` para que cada prueba parta igual.
3. **Mocks:**
   - `jasmine.createSpy` → simula funciones que llegan por props.
   - `spyOn(productosServicio, "obtenerTodos").and.returnValue([...])` → catálogo falso.
   - `spyOn(productosServicio, "descontarStock").and.returnValue({ ok: false, ... })` → simula stock insuficiente y comprueba que el pedido **no** se crea.
   - `spyOn(Storage.prototype, "getItem").and.throwError(...)` → navegador que bloquea localStorage.
   - `jasmine.clock().mockDate(...)` → fecha fija para el pedido.
4. **Análisis de resultados:** abre `coverage/index.html` → ~95 % de sentencias, ~90 % de ramas. Entra a una página y muestra las líneas en rojo (no cubiertas) y explica por qué son de bajo riesgo.
5. **Anécdota que suma puntos:** "La prueba del flujo de compra detectó un error real: al confirmar, la app volvía al carrito vacío en vez de ir a Mis pedidos. Lo corregí en `Checkout.tsx` con el estado `confirmado`."

---

## Preguntas probables y respuestas cortas
- **¿Diferencia entre props y estado?** Props: datos que el padre entrega y el hijo no modifica. Estado: datos propios del componente que, al cambiar con `setX`, hacen que se vuelva a renderizar.
- **¿Por qué Context?** Para no pasar el usuario y el carrito por props a través de muchos niveles; cualquier componente los lee con `useSesion()` / `useCarrito()`.
- **¿Para qué sirve la `key` en las listas?** Para que React identifique cada elemento; en `TablaInventario` la key incluye el stock para que la fila se reinicie si el stock cambia desde afuera.
- **¿Qué es un mock y para qué?** Un reemplazo controlado de una dependencia (servicio, función, reloj) para probar un componente aislado y simular casos difíciles, como un error de stock.
- **¿Qué diferencia hay entre Jasmine y Karma?** Jasmine es el framework con el que se escriben las pruebas (`describe`, `it`, `expect`, `spyOn`); Karma es el ejecutor que abre el navegador, corre las pruebas y genera los reportes.
- **¿Es segura la autenticación?** En el frontend se controlan vistas por rol y la sesión se valida contra los usuarios registrados, pero la seguridad real va en el backend (EP3): contraseñas con BCrypt, token JWT y endpoints protegidos.
- **¿Dónde se guardan los datos ahora?** En `localStorage`, a través de los servicios. En la EP3 esos servicios llamarán a los microservicios Spring Boot sin tocar los componentes.
