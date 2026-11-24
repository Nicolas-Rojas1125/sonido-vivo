# Guion para la presentación individual — EP3 (60 % de la nota)

La pauta evalúa 6 indicadores. Para cada uno: **qué decir**, **qué mostrar** y **preguntas probables**. Ten abiertos: VS Code con la carpeta `backend`, los 3 Swagger, HeidiSQL, Postman y la tienda en el navegador con las DevTools (F12 → pestaña *Network*).

---

## 1. IE3.1.2 — Backend conectado a base de datos (12 %)

**Di:** "El backend son 3 microservicios Spring Boot, cada uno con su base MySQL: ms-usuarios para autenticación y roles, ms-tienda para catálogo, inventario y pedidos, y ms-contactos para los mensajes. Cada uno tiene las capas Controller, Service, Repository y Model. Las tablas las crea Flyway con migraciones versionadas; Hibernate está en `validate`, solo comprueba que las entidades coincidan."

"La lógica de negocio responde a problemas del cliente: el stock se descuenta con un UPDATE atómico con `stock >= cantidad`, así dos compras simultáneas nunca venden lo que no hay; el pedido es todo-o-nada gracias a `@Transactional`; y el precio lo pone el servidor desde la base de datos, no el navegador."

**Muestra:** `PedidoService.crear` y `ProductoRepository.descontarStock` · HeidiSQL con las 3 bases y `flyway_schema_history` · el diagrama ER del documento de integración.

**Preguntas:** *¿Por qué productos y pedidos en el mismo microservicio?* → Porque la compra debe descontar stock y crear el pedido en una sola transacción. *¿Por qué no hay FK de pedido a usuario?* → Están en bases distintas; cada microservicio es dueño de sus datos; el id viene del token.

---

## 2. IE3.2.3 — API REST con CRUD y Swagger (12 %)

**Di:** "Cada microservicio expone su API REST con los métodos HTTP correctos: GET para leer, POST para crear (201), PUT/PATCH para actualizar y DELETE para eliminar (204). Los errores usan los códigos adecuados: 400 validación, 401 sin token, 403 sin permiso, 404 no existe, 409 conflicto. Están documentados con springdoc-openapi: `@Tag` y `@Operation` en cada endpoint, y la configuración agrega el esquema Bearer para probar con el token."

**Muestra (en vivo):** Swagger de ms-usuarios → login → copiar token → **Authorize** → Swagger de ms-tienda → Authorize → crear producto (201), crear el mismo (409), editarlo, eliminarlo (204).

**Preguntas:** *¿Diferencia entre PUT y PATCH?* → PUT reemplaza el recurso completo (editar producto); PATCH cambia una parte (solo el stock o el estado de la cuenta). *¿Por qué DTOs?* → Para no exponer campos internos (como el hash de la contraseña) y validar lo que entra.

---

## 3. IE3.2.4 — Integración frontend–backend y flujo de datos (10 %)

**Di:** "Todo el frontend usa un cliente HTTP único, `api.ts`: agrega el token, renueva si expira y convierte los errores del backend en mensajes para el usuario. Cada servicio del frontend tiene una función por endpoint."

"Para que el flujo sea eficiente: el catálogo se pide una sola vez y los filtros se aplican en el navegador; el panel pide resumen y productos en paralelo con `Promise.all`; el carrito envía solo códigos y cantidades; en el backend uso `@EntityGraph` para traer pedidos con su detalle en una consulta; y los microservicios verifican el token localmente, sin preguntarle a ms-usuarios en cada petición."

**Muestra:** DevTools → Network → hacer una compra → ver el `POST /api/pedidos` con el header `Authorization` y la respuesta 201. Luego comprar más de lo que hay en stock (o editar el stock en el panel) → 409 y alerta roja.

**Preguntas:** *¿Qué es CORS y por qué lo configuraste?* → El navegador bloquea llamadas entre orígenes distintos (5173 → 8083); el backend declara qué origen acepta.

---

## 4. IE3.3.4 — Autenticación con roles y JWT (10 %)

**Di:** "El login valida la contraseña con BCrypt y devuelve un JWT firmado con HS256 que dura 15 minutos y contiene el correo, el id y el rol. Los 3 microservicios verifican la firma, la expiración y el emisor con Spring Security (resource server). El rol del token se convierte en `ROLE_...` y cada ruta exige su rol con `hasRole`."

"Para renovar uso un refresh token de 7 días, aleatorio, que va en una cookie HttpOnly y SameSite=Strict. En la base guardo solo su hash. Se rota en cada uso: si alguien reutiliza uno viejo, cierro todas las sesiones del usuario porque puede ser robo."

**Muestra:** Postman: sin token → 401; con token de cliente a `/api/usuarios` → 403; con token de admin → 200. Pega un token en https://jwt.io para mostrar los claims (sin la clave no se puede falsificar). Test `AuthIntegracionTest.renovacionConRotacion`.

**Preguntas:** *¿Dónde está la clave secreta?* → En `application.properties` para desarrollo; en producción en la variable `JWT_SECRETO`. *¿Por qué dos tokens?* → El access token es corto para limitar el daño si se roba; el refresh token permite no pedir la clave cada 15 minutos y se puede revocar.

---

## 5. IE3.3.5 — Gestión de sesión en el frontend (8 %)

**Di:** "El access token vive solo en memoria, nunca en localStorage, para que un script malicioso no pueda robarlo. Cuando recargo la página, la memoria se borra; entonces `SesionProveedor` llama a `/api/auth/refresh` y el navegador envía la cookie HttpOnly. Si es válida, recupero el token y el usuario con su rol real desde el servidor. Mientras tanto se muestra 'Verificando sesión...'. Si un token expira durante el uso, `api.ts` lo renueva solo y repite la petición."

**Muestra:** Ingresar → F5 → sigues dentro. F12 → *Application → Local Storage*: no hay token. *Application → Cookies → localhost:8081*: `sv_refresh` con HttpOnly ✓. En la consola: `document.cookie` no muestra `sv_refresh`.

**Preguntas:** *¿Por qué no localStorage?* → Cualquier JavaScript de la página puede leerlo (XSS). *¿Qué pasa si edito mi rol en el navegador?* → Nada: el rol viene del token firmado y el backend lo vuelve a verificar.

---

## 6. IE3.3.6 — Restricciones de acceso en el frontend (8 %)

**Di:** "Como una tienda convencional, un invitado puede ver el catálogo y armar su carrito sin cuenta (el catálogo es público también en el backend: `permitAll` solo para `GET` de productos y para enviar contacto). Para comprar debe registrarse o iniciar sesión, y vuelve directo al checkout con su carrito. `RutaProtegida` envuelve las vistas privadas con los roles permitidos: sin sesión redirige al login y luego devuelve a la página pedida; con otro rol muestra 'Acceso denegado'. Los menús se arman según el rol, y las acciones también: el vendedor ve el carrito pero no puede comprar. Esto es la capa visual; la seguridad real está en el backend, que responde 403 aunque alguien salte la interfaz."

**Muestra:** Como vendedor, escribir `/admin/usuarios` → Acceso denegado. Como cliente, el menú no tiene "Panel". Como invitado: agregar un producto al carrito → **Crear cuenta y comprar** → registrarse → llega a *Finalizar compra* con el carrito intacto. Sin sesión, abrir `/mis-pedidos` → login → vuelve a Mis pedidos.

---

## Cierre (30 segundos)
"En resumen: tres microservicios con su base de datos y migraciones, API REST documentada en Swagger, autenticación JWT con roles y renovación segura, sesión persistente sin guardar el token en el navegador, y restricciones por rol en la interfaz respaldadas por el backend. Todo con 180 pruebas en el frontend y 24 pruebas de integración en el backend."
