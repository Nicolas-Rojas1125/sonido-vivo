# Documento de cobertura de testing – Sonido Vivo (Frontend)

**Asignatura:** DSY1104 Desarrollo Fullstack II – Evaluación Parcial 2
**Proyecto:** Tienda online Sonido Vivo (Forma B)
**Integrante(s):** Nicolás Rojas
**Fecha de ejecución:** 27-10-2026

## 1. Objetivo

Validar el alcance de las pruebas unitarias del frontend React: qué componentes, funciones y flujos quedan verificados, con qué herramientas, y cuánto del código ejecutan.

## 2. Entorno de pruebas

| Elemento | Herramienta / archivo |
|---|---|
| Framework de pruebas | Jasmine 5 (`describe`, `it`, `expect`, `beforeEach`, `spyOn`, `jasmine.createSpy`, `jasmine.clock`) |
| Ejecutor | Karma 6 en Chrome Headless (`karma.conf.cjs`) |
| Compilación de TS/TSX para las pruebas | Webpack + Babel (`preset-env`, `preset-react`, `preset-typescript`) |
| Renderizado de componentes | React Testing Library (`render`, `screen`, `fireEvent`, `within`, `renderHook`, `act`) |
| Cobertura | `babel-plugin-istanbul` (instrumenta) + `karma-coverage` (reporta) |
| Punto de entrada | `src/test/indice-pruebas.ts` (carga todos los `*.spec.ts(x)`) |
| Ayudas | `src/test/utilidades.tsx` (`reiniciarDatos`, `iniciarSesionComo`, `prepararCarrito`, `renderizarApp`, `escribir`) |

Comando: `npm test`. Reportes generados: consola (spec + resumen), `coverage/index.html`, `coverage/cobertura.txt` y `coverage/lcov.info`.

**Umbrales mínimos configurados** (si no se cumplen, `npm test` falla): sentencias 80 %, funciones 80 %, líneas 80 %, ramas 70 %.

## 3. Resultado general

**144 pruebas ejecutadas – 144 exitosas – 0 fallidas.**

| Métrica | Cobertura | Detalle |
|---|---|---|
| Sentencias | **95,55 %** | 817 / 855 |
| Ramas | **90,54 %** | 517 / 571 |
| Funciones | **94,51 %** | 293 / 310 |
| Líneas | **95,14 %** | 744 / 782 |

### Cobertura por carpeta

| Carpeta | Sentencias | Ramas | Funciones | Líneas |
|---|---|---|---|---|
| `src` (App) | 100 % | 50 % * | 100 % | 100 % |
| `componentes/atomos` | 100 % | 95,45 % | 100 % | 100 % |
| `componentes/moleculas` | 100 % | 93,75 % | 100 % | 100 % |
| `componentes/organismos` | 97,97 % | 97,32 % | 98,18 % | 97,82 % |
| `contexto` | 98 % | 96,42 % | 100 % | 97,87 % |
| `datos` | 100 % | 100 % | 100 % | 100 % |
| `paginas` | 91,66 % | 81,08 % | 79,06 % | 91,53 % |
| `paginas/admin` | 89,89 % | 80,32 % | 80 % | 88,88 % |
| `servicios` | 95,59 % | 83,07 % | 100 % | 94,57 % |
| `utilidades` | 96,34 % | 94,44 % | 100 % | 96,02 % |

\* En `App.tsx` la única rama sin cubrir es la opción `CATALOGO_PUBLICO = true`: el proyecto aplica la regla de seguridad del caso (todo requiere sesión), así que esa rama no se ejecuta.

> El detalle archivo por archivo (con las líneas no cubiertas marcadas en rojo) está en `coverage/index.html`. Pegar aquí una captura de ese reporte.

## 4. Inventario de pruebas

| Archivo de pruebas | N° | Qué se verifica |
|---|---|---|
| `utilidades/validaciones.spec.ts` | 16 | RUT chileno (válido, inválido, dígito K y 0, formato), formularios de contacto, login, usuario (contraseña segura, confirmación, edición sin clave, rol), producto (código, precio, stock) y checkout (despacho vs. retiro, medio de pago) |
| `utilidades/carrito.spec.ts` | 7 | Agregar, sumar cantidades, límite de stock, productos agotados, inmutabilidad, cambiar cantidad, quitar, subtotal y unidades |
| `utilidades/formato-filtros-stock.spec.ts` | 8 | Formato de precio CLP, fecha y número de pedido; enlace "Cómo llegar"; filtros por categoría y texto; ordenamiento; estado de stock |
| `servicios/servicios.spec.ts` | 17 | Almacenamiento (lectura/escritura y fallas de localStorage), CRUD de productos, descuento de stock "todo o nada", autenticación, usuarios desactivados, duplicados de correo/RUT, creación de pedidos, pedidos por cliente, cambio de estado y resumen de ventas |
| `componentes/atomos/atomos.spec.tsx` | 11 | Boton (clases, clic, deshabilitado, aria-pressed), Input, Selector, ImagenProducto (imagen de respaldo al fallar), Alerta, Insignia y MensajeError |
| `componentes/moleculas/moleculas.spec.tsx` | 12 | CampoFormulario (label, error, ayuda), SelectorCantidad (límites), CardProducto (datos, agregar, agotado), FiltroCategorias, SeguimientoPedido, FilaInventario, FilaPedido y FilaUsuario |
| `componentes/organismos/formularios.spec.tsx` | 12 | Formularios de contacto, login, usuario (registro/admin/edición), producto (alta, errores, edición) y checkout (cambio de entrega, retiro) |
| `componentes/organismos/navegacion.spec.tsx` | 11 | Navbar (menú hamburguesa, contador del carrito, enlaces por rol, cerrar sesión), RutaProtegida (redirige, deniega, permite), Carrusel y ResumenCompra |
| `contexto/contexto.spec.tsx` | 11 | Contexto del carrito (agregar, sincronizar con el catálogo al cargar, cambiar, quitar, vaciar, persistencia, error fuera del proveedor) y de sesión (login, mock del servicio, registro como cliente, cierre de sesión, **sesión manipulada en localStorage**, cuenta desactivada) |
| `datos/usuarios.spec.ts` | 3 | Reglas de acceso por rol y página de destino después del login |
| `paginas/paginas.spec.tsx` | 25 | **Regla de seguridad** (sin sesión todo redirige al login, registro público, retorno a la página pedida), inicio, catálogo (URL, filtros, búsqueda, servicio simulado), detalle, carrito (cliente y vendedor), **flujo completo de compra**, error de stock, mis pedidos, login, registro, contacto con mapa, nosotros y 404 |
| `paginas/admin/admin.spec.tsx` | 11 | Permisos del vendedor, resumen de ventas y restablecer datos, gestión de pedidos, inventario, CRUD de productos, gestión de usuarios/roles y bloqueo de cambio del propio rol |
| **Total** | **144** | |

## 5. Uso de mocks y espías

| Técnica | Dónde se usa | Para qué |
|---|---|---|
| `jasmine.createSpy("alClick")` | Átomos, moléculas y formularios | Simular las funciones que el padre pasa por props y comprobar que se llamaron con los datos correctos |
| `spyOn(servicio, "metodo").and.returnValue(...)` | Catálogo, checkout, sesión | Reemplazar la respuesta del servicio (catálogo falso, stock insuficiente, login fallido) sin depender de los datos reales |
| `spyOn(...).and.callThrough()` | Inventario, carrito, productos | Espiar la llamada sin cambiar el comportamiento (verificar que se guardó en el almacenamiento o que se llamó a `actualizarStock`) |
| `spyOn(Storage.prototype, "getItem").and.throwError(...)` | Almacenamiento | Simular un navegador que bloquea localStorage |
| `jasmine.clock().mockDate(...)` | Pedidos | Fijar la fecha para comprobar la fecha del pedido |
| `spyOn(console, "error")` | Contexto | Silenciar el error esperado al usar un hook fuera de su proveedor |

## 6. Análisis de resultados

- **Lógica de negocio** (`utilidades`, `servicios`, `contexto`): sobre 94 % de cobertura; se prueban los casos normales y los casos borde (stock 0, cantidades mayores al stock, RUT con K, correos duplicados, cuentas desactivadas).
- **Componentes visuales**: átomos y moléculas al 100 % de sentencias; las ramas restantes son valores por defecto de props (por ejemplo, el color por defecto de `Insignia`).
- **Páginas**: las partes no cubiertas son principalmente botones de cerrar mensajes (`alCerrar`) y algunos mensajes alternativos (por ejemplo, "Ya tienes en tu carrito todas las unidades disponibles"). Son de bajo riesgo y quedan como mejora.
- **Seguridad en el frontend:** las pruebas confirman que ninguna vista de la tienda se muestra sin sesión, que cada rol solo entra a sus secciones (también escribiendo la URL) y que editar el rol en localStorage no da permisos extra.
- **Error detectado gracias a las pruebas:** la prueba del flujo de compra detectó que, al confirmar un pedido, la página volvía al carrito vacío en lugar de mostrar "Mis pedidos" (el carrito se vaciaba antes de que terminara la navegación). Se corrigió en `Checkout.tsx` con el estado `confirmado` y la prueba ahora pasa.

## 7. Fuera del alcance de esta entrega

- `main.tsx` (solo monta la app) se excluye de la medición.
- Las imágenes del mapa (teselas de OpenStreetMap) dependen de internet; se verifica que el mapa se crea y que existen los enlaces "Cómo llegar", no el contenido de las teselas.
- Backend, API REST y base de datos corresponden a la Evaluación Parcial 3.
