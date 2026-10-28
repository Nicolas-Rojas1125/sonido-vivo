# Especificación de Requisitos del Software (ERS)
## Sonido Vivo – Tienda online de instrumentos y equipos musicales

| | |
|---|---|
| **Asignatura** | DSY1104 Desarrollo Fullstack II – Duoc UC |
| **Caso** | Forma B – Sonido Vivo |
| **Versión** | 2.0 – Evaluación Parcial 2 (propuesta personalizada, última versión) |
| **Autor(es)** | Nicolás Rojas |
| **Fecha** | 27-10-2026 |
| **Base** | Estructura IEEE 830 |

> Si en la EP1 entregaste una versión 1.0 del ERS, reemplázala por esta o copia aquí sus secciones propias (por ejemplo, el modelo de datos) manteniendo la numeración de requisitos.

### Historial de versiones
| Versión | Fecha | Descripción |
|---|---|---|
| 1.0 | EP1 | Levantamiento inicial del caso y requisitos |
| 2.0 | 27-10-2026 | Propuesta personalizada: frontend React implementado, reglas de roles, flujo de pedidos, mapa, plan de pruebas |

---

## 1. Introducción

### 1.1 Propósito
Este documento especifica los requisitos del sistema web de **Sonido Vivo**, tienda de instrumentos musicales ubicada en el Edificio Dos Caracoles, Providencia (Santiago), para que clientes de cualquier ciudad consulten el catálogo con stock real y hagan pedidos en línea, y para que el dueño y los vendedores gestionen pedidos, inventario y usuarios. Está dirigido al equipo de desarrollo, al docente evaluador y al dueño de la tienda.

### 1.2 Alcance
El sistema **Sonido Vivo Online** comprende:
- Una aplicación web **SPA en React** (frontend), responsiva para teléfono, tableta y escritorio. **Implementada en la EP2.**
- Microservicios **Spring Boot** con API REST/JSON, base de datos **MySQL** y despliegue en **AWS con Docker**. **Planificados para la EP3**; en la EP2 los servicios del frontend simulan esa API guardando los datos en el navegador.

Fuera de alcance: pago real con Webpay (se simula), integración automática con Starken/Chilexpress (el número de seguimiento se ingresa a mano) y venta presencial en caja.

### 1.3 Definiciones y abreviaturas
| Término | Significado |
|---|---|
| SPA | *Single Page Application*: la página no se recarga al navegar |
| RBAC | Control de acceso basado en roles |
| Pedido | Compra online: carrito confirmado con forma de entrega y estado |
| Stock crítico | Producto con 2 unidades o menos (configurable) |
| Punto de retiro | Lugar donde el cliente retira su pedido sin costo de envío |

### 1.4 Referencias
- Documento de contexto *DSY1104 – Forma B – Tienda Sonido Vivo*.
- Catálogo *DSY1104 – Forma B – Catálogo Sonido Vivo.xlsx* (51 productos de muestra de 340, 10 categorías).
- Instrucciones y rúbrica *Evaluación Parcial N° 2 – DSY1104*.

---

## 2. Descripción general

### 2.1 Problema actual
- 3 de cada 10 mensajes de clientes remotos (WhatsApp/Instagram) quedan sin respuesta el mismo día.
- No hay catálogo que el cliente pueda consultar por su cuenta.
- El stock en Excel queda desactualizado por horas, lo que provoca ventas de productos sin existencia y que dos vendedores vendan el mismo producto.
- No existe historial de compras por cliente ni registro centralizado de pedidos.
- El dueño se entera de los quiebres de stock recién en el conteo semanal.

### 2.2 Propuesta de solución (personalizada)
1. **Catálogo online con stock real**: los 340 productos con precio, marca, modelo, descripción y estado de stock ("Disponible", "Últimas unidades", "Agotado"); filtros por categoría, búsqueda y orden.
2. **Pedido formal en línea**: carrito → confirmación → **despacho a domicilio** (costo fijo) o **retiro gratis** en tienda / puntos de retiro → medio de pago → número de pedido (SV-0001…).
3. **Stock que se descuenta solo** al confirmar un pedido. La verificación es "todo o nada": si un producto no alcanza, el pedido no se crea. Así se evita vender lo que no hay.
4. **Seguimiento**: el cliente ve sus pedidos y su avance (En preparación → Despachado → Entregado) con el N° de seguimiento del courier.
5. **Panel interno** para dueño y vendedores: pedidos, inventario con alerta de stock crítico, resumen de ventas, mantenedor de productos y gestión de usuarios.
6. **Mapa** de la tienda y de los puntos de retiro, con enlace "Cómo llegar".

### 2.3 Usuarios y roles
| Rol | Usuario real | Permisos |
|---|---|---|
| **Administrador** | Dueño | Acceso total: resumen de ventas, pedidos, inventario, CRUD de productos, crear/editar/desactivar usuarios y asignar roles |
| **Vendedor** | 2 vendedores | Ver y actualizar el estado de los pedidos y el stock. No gestiona usuarios ni productos |
| **Cliente** | Cliente presencial o remoto | Ver catálogo, usar el carrito, hacer pedidos y ver **solo** su historial |

Nivel técnico: el dueño maneja Excel; los vendedores usan WhatsApp/Instagram; ninguno ha usado software de gestión → la interfaz debe ser simple, en español y con mensajes claros.

### 2.4 Restricciones
- Frontend **React (SPA)**; backend **Spring Boot** en microservicios; comunicación solo por **API REST/JSON**; BD relacional normalizada (3FN); AWS + Docker.
- Interfaz responsiva desde **360 px**; menú tipo hamburguesa en móvil.
- Datos de ventas y clientes confidenciales: **ninguna vista ni endpoint sin autenticación**, salvo inicio de sesión y registro.
- Dispositivos: teléfonos Android de los vendedores, un PC compartido y el notebook del dueño.

### 2.5 Suposiciones
- Los clientes tienen correo electrónico y acceso a internet.
- El costo de despacho es fijo ($5.990) mientras no se integre una tarifa por courier.
- El pago con Webpay se simula en esta etapa.

---

## 3. Requisitos funcionales

Prioridad: **A** = esencial, **M** = importante, **B** = deseable. Estado EP2: ✅ implementado en el frontend · ⏳ planificado para EP3 (backend).

### 3.1 Autenticación y usuarios
| ID | Requisito | Prioridad | Estado EP2 |
|---|---|---|---|
| RF-01 | El sistema permite iniciar sesión con correo y contraseña e informa si los datos son incorrectos o la cuenta está desactivada | A | ✅ |
| RF-02 | Un visitante puede registrarse como Cliente con RUT (validado con dígito verificador), nombre, correo y contraseña segura (mín. 8 caracteres con mayúscula, minúscula y número) | A | ✅ |
| RF-03 | Sin sesión, cualquier vista redirige al inicio de sesión (excepto login y registro); tras ingresar, vuelve a la página pedida si el rol tiene permiso | A | ✅ |
| RF-04 | Cada rol solo accede a sus vistas; si entra por URL a una vista no permitida ve "Acceso denegado" | A | ✅ |
| RF-05 | El Administrador crea, edita, activa/desactiva usuarios y asigna roles; no puede desactivarse ni cambiar su propio rol | A | ✅ |
| RF-06 | No se permiten dos usuarios con el mismo correo o RUT | A | ✅ |
| RF-07 | Las contraseñas se guardan encriptadas (BCrypt) y las rutas protegidas de la API exigen token válido | A | ⏳ |

### 3.2 Catálogo
| ID | Requisito | Prioridad | Estado EP2 |
|---|---|---|---|
| RF-08 | Mostrar el catálogo con imagen, marca, modelo, precio en CLP y estado de stock | A | ✅ |
| RF-09 | Filtrar por las 10 categorías del catálogo, buscar por nombre/marca/modelo/código y ordenar por precio o nombre; el filtro queda en la URL | A | ✅ |
| RF-10 | Ver el detalle de un producto y elegir la cantidad (máximo el stock disponible) | A | ✅ |
| RF-11 | El Administrador crea, edita y elimina productos (código único con formato AA000) | A | ✅ |

### 3.3 Carrito y pedidos
| ID | Requisito | Prioridad | Estado EP2 |
|---|---|---|---|
| RF-12 | Agregar productos al carrito, cambiar cantidades, quitar y vaciar; el carrito se conserva al recargar y se sincroniza con precios y stock actuales | A | ✅ |
| RF-13 | Solo el Cliente confirma pedidos, ingresando nombre, correo, teléfono, forma de entrega (despacho con dirección y comuna, o retiro en un punto) y medio de pago | A | ✅ |
| RF-14 | El total incluye el costo de despacho; el retiro es gratis | A | ✅ |
| RF-15 | Al confirmar, el stock se descuenta automáticamente; si algún producto no alcanza, se informa y no se crea el pedido | A | ✅ |
| RF-16 | El Cliente ve el historial de **sus** pedidos con estado, avance y N° de seguimiento | A | ✅ |
| RF-17 | Administrador y Vendedor ven todos los pedidos, los filtran por estado y actualizan estado y N° de seguimiento | A | ✅ |

### 3.4 Inventario y reportes
| ID | Requisito | Prioridad | Estado EP2 |
|---|---|---|---|
| RF-18 | Administrador y Vendedor actualizan el stock de cualquier producto y pueden ver solo los de stock crítico | A | ✅ |
| RF-19 | El panel muestra ventas totales, cantidad de pedidos por estado y la lista de productos con stock crítico | M | ✅ |
| RF-20 | Resumen de ventas filtrado por período (día, semana, mes) | M | ⏳ |

### 3.5 Contacto y ubicación
| ID | Requisito | Prioridad | Estado EP2 |
|---|---|---|---|
| RF-21 | Formulario de contacto validado (nombre, correo, teléfono opcional, asunto, mensaje) | M | ✅ (envío real en EP3) |
| RF-22 | Mapa interactivo con la tienda y los puntos de retiro, dirección, horario y enlace "Cómo llegar" | A | ✅ |

---

## 4. Requisitos no funcionales
| ID | Tipo | Requisito | Cómo se cumple |
|---|---|---|---|
| RNF-01 | Usabilidad | Interfaz en español, mensajes de error junto a cada campo y confirmaciones visibles | Componentes `CampoFormulario` + `MensajeError`, `Alerta` |
| RNF-02 | Responsividad | Funciona en 360 px, 768 px y 1280 px; menú hamburguesa en móvil; tablas y formularios adaptables | Bootstrap 5 (grilla, `navbar-expand-lg`, `table-responsive`); verificado en los 3 tamaños |
| RNF-03 | Seguridad | Sin sesión no se ve ninguna vista; control por rol; la sesión guardada se valida contra los usuarios registrados | `RutaProtegida`, `SesionProveedor`; en EP3 JWT + BCrypt |
| RNF-04 | Privacidad | Un cliente nunca ve pedidos de otros; las contraseñas nunca se muestran ni se devuelven a la interfaz | `obtenerPorCliente`, `sinClave` |
| RNF-05 | Integridad | El stock nunca queda negativo ni se vende más de lo disponible | `descontarStock` (todo o nada) y límites en el carrito |
| RNF-06 | Mantenibilidad | Código en TypeScript, componentes atómicos reutilizables y servicios separados de la interfaz | Estructura `atomos/moleculas/organismos/paginas/servicios` |
| RNF-07 | Calidad | Pruebas unitarias con Jasmine y Karma, con cobertura mínima del 80 % (sentencias, funciones, líneas) | 144 pruebas, ~95 % de cobertura (ver documento de cobertura) |
| RNF-08 | Accesibilidad | Etiquetas asociadas a campos, textos alternativos en imágenes, navegación con teclado | `label htmlFor`, `alt`, `aria-*` |
| RNF-09 | Rendimiento | El catálogo carga y filtra sin recargar la página | SPA con React |

---

## 5. Arquitectura propuesta

```
[Navegador: React SPA] ──HTTP/JSON──► [API Gateway]
                                          ├── ms-usuarios  (/api/usuarios, /api/auth)  ── BD usuarios
                                          ├── ms-productos (/api/productos)            ── BD productos
                                          └── ms-pedidos   (/api/pedidos)              ── BD pedidos
                              Todo en contenedores Docker sobre AWS
```

En la EP2, `src/servicios/productosServicio.ts`, `usuariosServicio.ts` y `pedidosServicio.ts` cumplen el papel de esos microservicios. En la EP3 se reemplaza su interior por llamadas `fetch` a la API, sin cambiar los componentes.

### 5.1 Entidades principales (modelo lógico)
| Entidad | Atributos |
|---|---|
| Usuario | id, rut (único), nombre, correo (único), clave (hash), rol, activo |
| Categoria | id, nombre, prefijo |
| Producto | codigo (PK), categoria_id (FK), nombre, marca, modelo, stock, precio, descripcion, imagen |
| Pedido | id, numero, fecha, usuario_id (FK), telefono, tipo_entrega, direccion, comuna, punto_retiro_id (FK), medio_pago, costo_envio, total, estado, seguimiento |
| DetallePedido | pedido_id (FK), producto_codigo (FK), cantidad, precio_unitario |
| PuntoRetiro | id, nombre, direccion, horario, latitud, longitud |

---

## 6. Trazabilidad: problema → requisito

| Problema del caso | Requisitos que lo resuelven |
|---|---|
| Mensajes sin responder / sin catálogo disponible | RF-08, RF-09, RF-10, RF-21 |
| Stock desactualizado y ventas sin existencia | RF-15, RF-18, RNF-05 |
| Dos vendedores venden el mismo producto | RF-15 (descuento inmediato y verificación todo o nada) |
| Sin registro centralizado de pedidos remotos | RF-13, RF-17 |
| Sin historial por cliente | RF-16 |
| Seguimiento anotado a mano | RF-17 (N° de seguimiento visible para el cliente) |
| Dueño sin visibilidad del stock ni de las ventas | RF-19, RF-20 |
| Datos confidenciales | RF-03, RF-04, RF-07, RNF-03, RNF-04 |

## 7. Criterios de aceptación (EP2)
- Las 144 pruebas unitarias pasan con `npm test` y la cobertura supera los umbrales configurados.
- Cada vista funciona en 360, 768 y 1280 px sin desplazamiento horizontal de la página.
- Con los usuarios de prueba se puede demostrar: compra completa como Cliente, gestión de pedidos y stock como Vendedor, y gestión de usuarios y productos como Administrador.
