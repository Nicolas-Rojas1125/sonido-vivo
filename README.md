# Sonido Vivo – Tienda online (Frontend React)

Proyecto de la **Evaluación Parcial 2 – DSY1104 Desarrollo Fullstack II (Duoc UC)**, caso **Forma B: Sonido Vivo**, tienda de instrumentos y equipos musicales (ubicada en el Edificio Dos Caracoles, Providencia).

Aplicación SPA hecha con **React + TypeScript + Vite**, diseño responsivo con **Bootstrap 5** y **pruebas unitarias con Jasmine + Karma** (144 pruebas, ~95 % de cobertura).

---

## 1. Tecnologías

| Capa | Herramienta |
|---|---|
| Framework frontend | React 19 (SPA) + TypeScript |
| Empaquetador / servidor de desarrollo | Vite |
| Navegación | React Router (rutas, rutas anidadas y rutas protegidas por rol) |
| Diseño responsivo | Bootstrap 5 (grilla `row`/`col`, navbar colapsable, tablas responsivas) + `index.css` |
| Mapa | Leaflet + React Leaflet (OpenStreetMap) |
| Pruebas unitarias | Jasmine (framework) + Karma (ejecutor en Chrome) + React Testing Library |
| Cobertura | karma-coverage + babel-plugin-istanbul |

## 2. Cómo ejecutarlo

Requisitos: **Node.js 20.19+ o 22.12+** (lo pide Vite 8; revisa con `node -v`) y **Google Chrome** instalado.

```bash
npm install          # instala dependencias (solo la primera vez)
npm run dev          # abre la app en http://localhost:5173
npm test             # ejecuta las 144 pruebas en Chrome (sin ventana) y genera la cobertura
npm run test:watch   # abre Chrome visible y vuelve a probar cada vez que guardas
npm run build        # compila para producción (carpeta dist/)
npm run lint         # revisa el código con ESLint
```

Después de `npm test`, abre **`coverage/index.html`** en el navegador para ver el reporte de cobertura archivo por archivo (sirve para el documento de cobertura y la presentación).

### Usuarios de prueba (uno por rol del caso)

| Rol | Correo | Contraseña | Qué puede hacer |
|---|---|---|---|
| Administrador | admin@sonidovivo.cl | Admin123 | Todo: resumen, pedidos, inventario, productos (CRUD) y usuarios (crear, editar, desactivar, asignar rol) |
| Vendedor | vendedor@sonidovivo.cl | Vende123 | Ver/actualizar pedidos y stock. No gestiona usuarios ni productos |
| Cliente | cliente@correo.cl | Cliente123 | Catálogo, carrito, compra (despacho o retiro) y ver **solo sus** pedidos |

> **Regla de seguridad del caso (sección 0.2):** ninguna vista se puede ver sin iniciar sesión, salvo **Iniciar sesión** y **Crear cuenta**. Al abrir la app sin sesión siempre llegas al login. Si tu docente permite ver la tienda sin cuenta, cambia `CATALOGO_PUBLICO` a `true` en `src/datos/tienda.ts`.
>
> La sesión guardada se valida contra los usuarios registrados: si alguien edita su rol en localStorage, se usa su rol real; si la cuenta fue desactivada, se cierra la sesión.

> Los datos se guardan en el navegador (localStorage) mientras no exista el backend. Si cambias datos en el código y no ves el cambio, entra como administrador → **Panel → Resumen → "Restablecer datos"**.

---

## 3. Cómo poner las imágenes

Las imágenes van en la carpeta **`public/imagenes/`** (todo lo que está en `public` se sirve desde la raíz del sitio, por eso en el código las rutas empiezan con `/imagenes/...`). No hay que importar nada en el código.

| Carpeta | Qué va | Nombre del archivo |
|---|---|---|
| `public/imagenes/productos/` | Una foto por producto | **El código del producto** + `.jpg` → `GA001.jpg`, `MI001.jpg`… (lista completa en `LEEME.txt` dentro de la carpeta) |
| `public/imagenes/carrusel/` | 3 fotos horizontales del inicio | `carrusel1.jpg`, `carrusel2.jpg`, `carrusel3.jpg` |
| `public/imagenes/nosotros/` | 3 fotos de la página Nosotros | `asesoria.jpg`, `taller.jpg`, `tienda.jpg` |

- **Respeta mayúsculas y la extensión**: `GA001.jpg` ≠ `ga001.JPG` (en Windows funciona igual, pero en un servidor Linux/AWS no).
- Si una foto falta, la app muestra `sin-imagen.svg` automáticamente (componente `ImagenProducto`), así que puedes ir agregándolas de a poco.
- Si quieres usar `.png` o `.webp`, cambia la extensión en `src/datos/productos.ts` (campo `imagen`), en `src/datos/inicio.ts` (carrusel) o en `src/paginas/Nosotros.tsx`.
- Los productos nuevos creados desde el panel buscan su imagen como `/imagenes/productos/CODIGO.jpg`.
- Usa fotos propias o con licencia libre (por ejemplo, Unsplash o Pexels) y que pesen menos de ~300 KB.

## 4. Dónde cambiar tus datos

| Qué cambiar | Archivo |
|---|---|
| **Tu nombre / integrantes**, asignatura, enlace a tu GitHub (aparecen en el footer) | `src/datos/tienda.ts` → objeto `proyecto` |
| Dirección, teléfono, WhatsApp, correo, Instagram, horario de la tienda | `src/datos/tienda.ts` → objeto `tienda` |
| Ubicación del mapa (latitud, longitud) y puntos de retiro | `src/datos/tienda.ts` → `tienda.coordenadas` y `puntosRetiro` |
| Costo de despacho y límite de "stock crítico" | `src/datos/tienda.ts` → `COSTO_DESPACHO`, `STOCK_CRITICO` |
| Catálogo (51 productos del Excel) | `src/datos/productos.ts` |
| Categorías | `src/datos/categorias.ts` |
| Usuarios de prueba | `src/datos/usuarios.ts` |
| Textos del carrusel, beneficios y productos destacados del inicio | `src/datos/inicio.ts` |
| Colores de la marca | `src/index.css` (variables `--sv-...` al inicio) |
| Título de la pestaña del navegador | `index.html` |
| Ícono de la pestaña | `public/favicon.svg` |

Para obtener coordenadas: en Google Maps haz clic derecho sobre el lugar → el primer número es la latitud y el segundo la longitud.

---

## 5. Estructura del proyecto (diseño atómico)

```
src/
├── componentes/
│   ├── atomos/       Boton, Input, Selector, AreaTexto, MensajeError, Insignia, Alerta, ImagenProducto
│   ├── moleculas/    CampoFormulario, CampoSelector, CardProducto, SelectorCantidad, FilaCarrito, FilaPedido, ...
│   └── organismos/   Navbar, Footer, Hero, Carrusel, Formulario*, Tabla*, MapaTiendas, RutaProtegida, ...
├── paginas/          Inicio, Productos, DetalleProducto, Carrito, Checkout, MisPedidos, Login, Registro, ...
│   └── admin/        LayoutAdmin, PanelResumen, AdminPedidos, AdminInventario, AdminProductos, AdminUsuarios
├── contexto/         Estado global con Context: sesión (usuario y rol) y carrito
├── servicios/        productosServicio, usuariosServicio, pedidosServicio (simulan la futura API REST)
├── datos/            Datos iniciales (catálogo del Excel, usuarios, tienda, pedidos de ejemplo)
├── utilidades/       Funciones puras: validaciones (RUT, formularios), carrito, formato, filtros, stock
├── tipos/            Interfaces TypeScript (Producto, Usuario, Pedido, Contacto)
└── test/             Configuración de pruebas (índice de Karma y funciones de ayuda)
```

Las pruebas (`*.spec.ts` / `*.spec.tsx`) están junto al código que prueban.

### Rutas

| Ruta | Página | Acceso |
|---|---|---|
| `/login` · `/registro` | Inicio de sesión · Registro de clientes | **Únicas vistas públicas** |
| `/` | Inicio (hero, carrusel, categorías, destacados) | Cualquier rol con sesión |
| `/productos` · `/productos/:codigo` | Catálogo con filtros/búsqueda/orden · Detalle | Cualquier rol con sesión |
| `/carrito` | Carrito (solo el Cliente puede continuar a la compra) | Cualquier rol con sesión |
| `/nosotros` · `/contacto` | Nosotros · Contacto + mapa Leaflet | Cualquier rol con sesión |
| `/checkout` · `/mis-pedidos` | Compra (despacho o retiro) · Historial y seguimiento | Cliente |
| `/admin` (+ `pedidos`, `inventario`) | Panel: resumen de ventas, pedidos, stock | Administrador y Vendedor |
| `/admin/productos` · `/admin/usuarios` | CRUD de productos · Gestión de usuarios y roles | Solo Administrador |

---

## 6. Relación con la rúbrica (guía para la presentación)

### IE2.1.1 / IE2.1.3 – Proyecto con framework JavaScript
- SPA en React con Vite y TypeScript; `main.tsx` monta la app con `BrowserRouter` y los proveedores de estado.
- Estructura en capas: componentes (átomos → moléculas → organismos → páginas), servicios, contexto, utilidades y tipos.
- Navegación con React Router: rutas anidadas (`/admin/*` con `<Outlet />`), parámetros (`/productos/:codigo`), query string (`?categoria=`), redirecciones y 404.

### IE2.1.2 / IE2.1.4 – Props, estado y Bootstrap
- **Props**: todos los componentes reciben datos y funciones por props tipadas (`type Props`). Ej: `CardProducto` recibe `producto` y la función `alAgregar`.
- **Estado local (`useState`)**: formularios controlados (`FormularioCheckout`, `FormularioUsuario`…), menú hamburguesa (`Navbar`), carrusel, cantidad (`DetalleProducto`), filas editables (`FilaInventario`, `FilaPedido`).
- **Levantar el estado**: `FormularioCheckout` avisa el tipo de entrega con `alCambiarEntrega` y la página `Checkout` recalcula el costo de envío.
- **Estado global (Context + hooks personalizados)**: `useSesion()` (usuario y rol) y `useCarrito()` (items, total, unidades), persistidos en localStorage con `useEffect`.
- **Validaciones** en `utilidades/validaciones.ts`: RUT chileno (módulo 11), correo, teléfono, contraseña segura, precio/stock, datos de despacho.
- **Responsivo con Bootstrap** (probado a 360, 768 y 1280 px): `navbar-expand-lg` con menú hamburguesa, grilla `row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4`, `table-responsive` y columnas que se ocultan en móvil (`d-none d-md-table-cell`), formularios `col-12 col-md-6`, menú del panel lateral en escritorio y horizontal en móvil.

### IE2.2.1 / IE2.2.2 – Pruebas con Jasmine y Karma
144 pruebas en 12 archivos `.spec`, que verifican **lógica** (funciones puras y servicios), **comportamiento** (clics, envíos de formularios, navegación) y **manipulación del DOM** (clases, atributos, elementos que aparecen/desaparecen).

### IE2.3.1 / IE2.3.2 – Proceso de testeo
- **Configuración del entorno**: `karma.conf.cjs` (Jasmine + Webpack/Babel para compilar TSX + Chrome Headless + cobertura) y `src/test/indice-pruebas.ts` (carga todos los `.spec`).
- **Qué no está probado y por qué**: ver la sección 7 de `docs/COBERTURA_TESTING.md`.
- **Escritura**: patrón *Preparar → Actuar → Verificar* con `describe`/`it`/`expect`, `beforeEach` para reiniciar datos.
- **Mocks**: `jasmine.createSpy` (props de función), `spyOn(...).and.returnValue` (servicio simulado), `spyOn(...).and.callThrough` (espía), `spyOn(Storage.prototype, "getItem").and.throwError` (falla de localStorage) y `jasmine.clock().mockDate` (fecha fija).
- **Análisis de resultados**: salida de Karma en consola + reporte HTML en `coverage/index.html`, con umbrales mínimos (80 % sentencias/funciones/líneas, 70 % ramas) que hacen fallar `npm test` si la cobertura baja. Detalle en `docs/COBERTURA_TESTING.md`.

### Documentos de la entrega (carpeta `docs/`)
| Archivo | Entregable de la pauta |
|---|---|
| `docs/ERS_Sonido_Vivo.md` | Documento ERS (propuesta terminada, última versión) |
| `docs/COBERTURA_TESTING.md` | Documento de cobertura de testing |
| `docs/GUION_PRESENTACION.md` | Apoyo para la presentación individual (Situación evaluativa 2) |

---

## 7. Subir a GitHub (entregable)

```bash
git init
git add .
git commit -m "EP2: frontend React Sonido Vivo con pruebas Jasmine/Karma"
git branch -M main
git remote add origin https://github.com/Nicolas-Rojas1125/sonido-vivo.git
git push -u origin main
```

`node_modules`, `dist` y `coverage` no se suben (están en `.gitignore`). Para el **proyecto comprimido**, comprime la carpeta **sin** `node_modules`.

## 8. Próximos pasos (EP3)

Los servicios de `src/servicios/` están pensados para ser reemplazados por llamadas `fetch` a los microservicios Spring Boot (`/api/productos`, `/api/usuarios`, `/api/pedidos`), con autenticación por token y contraseñas encriptadas (BCrypt) en el backend.
