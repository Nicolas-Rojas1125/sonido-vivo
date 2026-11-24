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
| Ayudas | `src/test/utilidades.tsx` (`reiniciarDatos`, `iniciarSesionComo`, `prepararCarrito`, `renderizarApp`, `escribir`, `respuestaJson`) |

Comando: `npm test`. Reportes generados: consola (spec + resumen), `coverage/index.html`, `coverage/cobertura.txt` y `coverage/lcov.info`.

**Umbrales mínimos configurados** (si no se cumplen, `npm test` falla): sentencias 80 %, funciones 80 %, líneas 80 %, ramas 70 %.

## 3. Resultado general

**180 pruebas ejecutadas – 180 exitosas – 0 fallidas.** Desde la EP3 las pruebas usan un **backend falso** (`src/test/backendFalso.ts`) que simula los 3 microservicios (tokens, 401/403, stock 409), así no necesitan Laragon ni Spring Boot encendidos. El backend tiene además 24 pruebas de integración propias (JUnit + MockMvc, ver `docs/DOCUMENTO_INTEGRACION.md`).

| Métrica | Cobertura | Detalle |
|---|---|---|
| Sentencias | **96,26 %** | 979 / 1017 |
| Ramas | **91,9 %** | 602 / 655 |
| Funciones | **94,79 %** | 346 / 365 |
| Líneas | **96,06 %** | 903 / 940 |

### Cobertura por carpeta

| Carpeta | Sentencias | Ramas | Funciones | Líneas |
|---|---|---|---|---|
| `src` (App) | 100 % | 100 % | 100 % | 100 % |
| `componentes/atomos` | 100 % | 95,45 % | 100 % | 100 % |
| `componentes/moleculas` | 100 % | 93,84 % | 100 % | 100 % |
| `componentes/organismos` | 96,49 % | 97,56 % | 95,38 % | 96,2 % |
| `contexto` | 98,55 % | 96,29 % | 100 % | 100 % |
| `datos` | 100 % | 92,3 % | 100 % | 100 % |
| `paginas` | 93,52 % | 89,01 % | 82,69 % | 93,25 % |
| `paginas/admin` | 92,12 % | 84 % | 87,27 % | 91,39 % |
| `servicios` | 99,37 % | 85,48 % | 100 % | 99,31 % |
| `utilidades` | 96,47 % | 94,61 % | 100 % | 96,15 % |

> El detalle archivo por archivo (con las líneas no cubiertas marcadas en rojo) está en `coverage/index.html`. Pegar aquí una captura de ese reporte.

## 4. Inventario de pruebas

| Archivo de pruebas | N° | Qué se verifica |
|---|---|---|
| `utilidades/validaciones.spec.ts` | 16 | RUT chileno (válido, inválido, dígito K y 0, formato), formularios de contacto, login, usuario (contraseña segura, confirmación, edición sin clave, rol), producto (código, precio, stock) y checkout (despacho vs. retiro, medio de pago) |
| `utilidades/carrito.spec.ts` | 7 | Agregar, sumar cantidades, límite de stock, productos agotados, inmutabilidad, cambiar cantidad, quitar, subtotal y unidades |
| `utilidades/formato-filtros-stock.spec.ts` | 8 | Formato de precio CLP, fecha y número de pedido; enlace "Cómo llegar"; filtros por categoría y texto; ordenamiento; estado de stock |
| `servicios/servicios.spec.ts` | 23 | Almacenamiento; cliente HTTP (header Bearer, catálogo y contacto públicos para el invitado, 401 en recursos privados, servidor apagado, mensajes del backend); autenticación JWT (login, cuenta desactivada, **una sola renovación simultánea**, logout sin conexión); productos, pedidos (precio del servidor, stock 409 "todo o nada", permisos 403) y usuarios contra el backend falso |
| `componentes/atomos/atomos.spec.tsx` | 11 | Boton (clases, clic, deshabilitado, aria-pressed), Input, Selector, ImagenProducto (imagen de respaldo al fallar), Alerta, Insignia y MensajeError |
| `componentes/moleculas/moleculas.spec.tsx` | 12 | CampoFormulario (label, error, ayuda), SelectorCantidad (límites), CardProducto (datos, agregar, agotado), FiltroCategorias, SeguimientoPedido, FilaInventario, FilaPedido y FilaUsuario |
| `componentes/organismos/formularios.spec.tsx` | 14 | Formularios de contacto (incluye envío asíncrono: botón "Enviando...", sin doble envío y sin borrar los datos si falla), login, usuario (registro/admin/edición), producto (alta, errores, edición) y checkout (cambio de entrega, retiro) |
| `componentes/organismos/navegacion.spec.tsx` | 12 | Navbar (menú hamburguesa, contador del carrito, enlaces por rol, cerrar sesión), RutaProtegida (redirige, deniega, permite), Carrusel y ResumenCompra |
| `contexto/contexto.spec.tsx` | 15 | Contexto del carrito (agregar, sincronizar con el catálogo al cargar, cambiar, quitar, vaciar, persistencia, error fuera del proveedor) y de sesión JWT (token solo en memoria, mock del servicio, registro, logout que revoca en el servidor, **recuperar la sesión al recargar**, rol manipulado en el navegador, cuenta desactivada, **renovación automática del token expirado**, aviso de sesión expirada y reintento como invitado en rutas públicas) |
| `datos/usuarios.spec.ts` | 3 | Reglas de acceso por rol y página de destino después del login |
| `paginas/paginas.spec.tsx` | 30 | **Acceso como invitado** (tienda y carrito sin cuenta, vistas privadas siguen pidiendo sesión, "Seguir como invitado", retorno a la página pedida), **invitado → crear cuenta → checkout con el mismo carrito**, inicio, catálogo (URL, filtros, búsqueda, servicio simulado), detalle, carrito (cliente y vendedor), **flujo completo de compra**, error de stock, mis pedidos, login, registro, contacto con mapa (envío POST al backend simulado y error si el servidor está apagado), nosotros y 404 |
| `paginas/admin/admin.spec.tsx` | 13 | Permisos del vendedor, resumen de ventas y restablecer datos, gestión de pedidos, inventario, CRUD de productos, gestión de usuarios/roles y bloqueo de cambio del propio rol |
| `servicios/contactosServicio.spec.ts` | 7 | Peticiones a la API REST del microservicio: POST (URL, método y JSON con los nombres de la entidad), GET, PUT `/{id}/atendido`, DELETE con respuesta 204, y errores 400/404 |
| `paginas/admin/contactos.spec.tsx` | 9 | Panel → Contactos: menú para el vendedor, listado desde el backend y contador de pendientes, filtro por estado, marcar atendido (PUT), eliminar con confirmación (DELETE), servidor apagado + reintentar, y error en una acción |
| **Total** | **180** | |

## 5. Uso de mocks y espías

| Técnica | Dónde se usa | Para qué |
|---|---|---|
| `jasmine.createSpy("alClick")` | Átomos, moléculas y formularios | Simular las funciones que el padre pasa por props y comprobar que se llamaron con los datos correctos |
| `spyOn(servicio, "metodo").and.returnValue(...)` | Catálogo, checkout, sesión | Reemplazar la respuesta del servicio (catálogo falso, stock insuficiente, login fallido) sin depender de los datos reales |
| `spyOn(...).and.callThrough()` | Inventario, carrito, productos | Espiar la llamada sin cambiar el comportamiento (verificar que se guardó en el almacenamiento o que se llamó a `actualizarStock`) |
| `spyOn(Storage.prototype, "getItem").and.throwError(...)` | Almacenamiento | Simular un navegador que bloquea localStorage |
| `jasmine.clock().mockDate(...)` | Pedidos | Fijar la fecha para comprobar la fecha del pedido |
| `spyOn(window, "fetch").and.resolveTo(respuestaJson(...))` | Contacto, panel Contactos, servicio de contactos | Simular las respuestas de Spring Boot (201, 200, 204, 400, 404, 500) sin necesitar el backend encendido |
| `spyOn(window, "fetch").and.callFake(...)` | Panel Contactos | "Backend falso" que responde según el método HTTP y la URL, para probar el ciclo completo listar → actualizar → recargar |
| `spyOn(window, "fetch").and.rejectWith(...)` | Contacto, panel Contactos | Simular que el microservicio está apagado (error de red) |
| `spyOn(window, "confirm").and.returnValues(false, true)` | Panel Contactos | Simular que el usuario cancela y luego acepta la eliminación |
| `spyOn(console, "error")` | Contexto, Contacto | Silenciar el error esperado al usar un hook fuera de su proveedor |

## 6. Análisis de resultados

- **Lógica de negocio** (`utilidades`, `servicios`, `contexto`): sobre 94 % de cobertura; se prueban los casos normales y los casos borde (stock 0, cantidades mayores al stock, RUT con K, correos duplicados, cuentas desactivadas).
- **Componentes visuales**: átomos y moléculas al 100 % de sentencias; las ramas restantes son valores por defecto de props (por ejemplo, el color por defecto de `Insignia`).
- **Páginas**: las partes no cubiertas son principalmente botones de cerrar mensajes (`alCerrar`) y algunos mensajes alternativos (por ejemplo, "Ya tienes en tu carrito todas las unidades disponibles"). Son de bajo riesgo y quedan como mejora.
- **Seguridad en el frontend:** las pruebas confirman que ninguna vista de la tienda se muestra sin sesión, que cada rol solo entra a sus secciones (también escribiendo la URL) y que editar el rol en localStorage no da permisos extra.
- **Error detectado gracias a las pruebas:** la prueba del flujo de compra detectó que, al confirmar un pedido, la página volvía al carrito vacío en lugar de mostrar "Mis pedidos" (el carrito se vaciaba antes de que terminara la navegación). Se corrigió en `Checkout.tsx` con el estado `confirmado` y la prueba ahora pasa.

## 7. Fuera del alcance de esta entrega

- `main.tsx` (solo monta la app) se excluye de la medición.
- Las imágenes del mapa (teselas de OpenStreetMap) dependen de internet; se verifica que el mapa se crea y que existen los enlaces "Cómo llegar", no el contenido de las teselas.
- El microservicio Spring Boot (`backend/ms-contactos`) no se prueba con Karma: las pruebas del frontend simulan sus respuestas. El backend se prueba con Postman (colección en `backend/ms-contactos/postman/`).
