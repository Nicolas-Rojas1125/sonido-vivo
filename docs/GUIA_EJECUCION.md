# Guía de ejecución — Sonido Vivo (frontend + 3 microservicios)

## 1. Qué hay que levantar

| Pieza | Carpeta | Puerto | Base de datos MySQL | Swagger |
|---|---|---|---|---|
| MySQL (Laragon) | — | 3306 | — | — |
| **ms-usuarios** (login JWT, usuarios y roles) | `backend/ms-usuarios` | **8081** | `sonidovivo_usuarios` | http://localhost:8081/swagger-ui.html |
| **ms-contactos** (mensajes de contacto) | `backend/ms-contactos` | **8082** | `sonidovivo_contactos` | http://localhost:8082/swagger-ui.html |
| **ms-tienda** (catálogo, inventario, pedidos) | `backend/ms-tienda` | **8083** | `sonidovivo_tienda` | http://localhost:8083/swagger-ui.html |
| **Frontend React** | `sonido_vivo` | **5173** | — | — |

Las bases de datos **se crean solas** (`createDatabaseIfNotExist=true`) y Flyway crea las tablas y carga los datos iniciales (usuarios de prueba, 51 productos y 3 pedidos de ejemplo).

**Orden:** MySQL → ms-usuarios → ms-tienda y ms-contactos → frontend. (ms-usuarios primero, porque emite los tokens que usan los demás.)

## 2. Requisitos (una sola vez)

- **Laragon** con MySQL 8 (en tu equipo ya funciona: MySQL 8.4).
- **JDK 17 o superior** (ya tienes JDK 21).
- **VS Code** con *Extension Pack for Java* y *Spring Boot Extension Pack*.
- **Node.js 20.19+ o 22.12+**.
- **Postman** (para probar la API).

## 3. Paso a paso

### 3.1 MySQL
Laragon → **Iniciar todo**.

### 3.2 Los 3 microservicios (VS Code)
La forma más simple es abrir la carpeta **`backend`** completa en VS Code (*File → Open Folder… → backend*). La extensión de Java detecta los 3 proyectos Maven y el panel **Spring Boot Dashboard** muestra `ms-usuarios`, `ms-contactos` y `ms-tienda`.

1. Espera a que termine de importar (la primera vez descarga las dependencias nuevas: Spring Security, JWT y Swagger; puede tardar unos minutos).
2. En **Spring Boot Dashboard**, pulsa ▶ en `ms-usuarios`, luego en `ms-tienda` y en `ms-contactos`. (También puedes seleccionarlos y pulsar ▶ una vez para iniciar varios.)
3. En la consola de cada uno debe aparecer `Tomcat started on port 808X` y `Started ...Application`.

> **ms-contactos ya existía en tu base de datos.** Su migración no cambió, así que Flyway no vuelve a ejecutar nada; solo cambia la seguridad.

### 3.3 Frontend
En otra terminal:
```powershell
cd ...\sonido_vivo_NicolasRojas\sonido_vivo
npm install      # la primera vez
npm run dev      # http://localhost:5173
```

### 3.4 Usuarios de prueba
| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@sonidovivo.cl | Admin123 |
| Vendedor | vendedor@sonidovivo.cl | Vende123 |
| Cliente | cliente@correo.cl | Cliente123 |

## 4. Probar con Swagger

1. Abre http://localhost:8081/swagger-ui.html → **Autenticación → POST /api/auth/login** → *Try it out* → `{"correo":"admin@sonidovivo.cl","clave":"Admin123"}` → *Execute*.
2. Copia el `accessToken` de la respuesta.
3. Pulsa **Authorize** (candado arriba a la derecha), pega el token y acepta.
4. Ya puedes ejecutar los endpoints protegidos. El mismo token sirve en el Swagger de ms-tienda (8083) y ms-contactos (8082): pulsa Authorize en cada uno.
5. El token dura **15 minutos**. Si aparece 401, vuelve a hacer login.

## 5. Probar con Postman

Cada microservicio tiene su colección en `backend/<servicio>/postman/`. Impórtalas (*Import*). Las peticiones de login guardan el token automáticamente en la variable `{{token}}` y las demás lo envían como Bearer. Están ordenadas para mostrar los casos 200/201/204 y también 400, 401, 403 y 409.

## 6. Pruebas automáticas

```powershell
# Frontend (Jasmine + Karma): 180 pruebas, NO necesitan el backend
cd sonido_vivo
npm test

# Backend (JUnit 5 + MockMvc): pruebas de integración, necesitan Laragon encendido
# Usan bases de PRUEBA separadas (sonidovivo_*_test) y deshacen los cambios al terminar.
```
En VS Code: abre la vista **Testing** (ícono del matraz) y ejecuta las pruebas de cada microservicio, o clic derecho sobre `AuthIntegracionTest.java` → *Run Tests*.

## 7. Problemas comunes

| Síntoma | Solución |
|---|---|
| `Communications link failure` | MySQL apagado → Laragon → Iniciar todo |
| `Port 808X was already in use` | Ya hay una instancia corriendo (o el proyecto `mensajeria` de clase en el 8082). Detenla |
| Login funciona pero el catálogo dice "No se pudo conectar con el servidor" | ms-tienda no está corriendo (puerto 8083) |
| En la consola del navegador: *blocked by CORS policy* | Vite no está en el puerto 5173 (se fue al 5174). Cierra la otra ventana de Vite |
| Al recargar la página te saca de la sesión | ms-usuarios apagado (la sesión se recupera con `/api/auth/refresh`) o pasaron más de 7 días |
| 401 en Swagger/Postman | Token vencido (15 min) o no pegado en Authorize → login de nuevo |
| 403 | El rol del token no tiene permiso (ej: CLIENTE intentando crear productos). Es el comportamiento esperado |
| `Validate failed: Migration checksum mismatch` | Se modificó una migración ya aplicada. No edites V1, V2…; crea una nueva versión |
| VS Code muestra errores rojos en los imports de Spring Security | Aún no termina de descargar dependencias. Espera, o clic derecho en `pom.xml` → *Reload Project* |
