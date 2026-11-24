# Manual de usuario — Tienda online Sonido Vivo

> **Para completar:** donde dice `📷 PANTALLAZO`, toma la captura con todo funcionando (MySQL + 3 microservicios + `npm run dev`) y reemplaza la línea por la imagen. En Windows: **Win + Shift + S** → selecciona → pega en Word, o guarda en `docs/capturas/` y usa `![texto](capturas/nombre.png)` en este archivo.

---

## 1. Introducción
Sonido Vivo es la tienda online de instrumentos y equipos musicales ubicada en el Edificio Dos Caracoles (Providencia). Este manual explica cómo usarla según el rol de cada persona:

| Rol | Puede |
|---|---|
| **Cliente** | Ver el catálogo, comprar con despacho o retiro, revisar sus pedidos y escribir a la tienda |
| **Vendedor** | Gestionar pedidos (estado y seguimiento), actualizar stock y responder mensajes de contacto |
| **Administrador** | Todo lo anterior + crear/editar/eliminar productos y gestionar usuarios y roles |

---

## 2. Ingresar al sistema

### 2.0 Navegar como invitado (sin cuenta)
1. Abre la tienda: entras directamente al **Inicio** como invitado (la barra dice *"Hola, invitado"*).
2. Puedes ver el catálogo, el detalle de cada producto, Nosotros y Contacto, enviar un mensaje y **agregar productos al carrito**.
3. Para pagar, en el carrito pulsa **Crear cuenta y comprar** (o **Ya tengo cuenta: iniciar sesión**). Al terminar llegas directo a **Finalizar compra** y tu carrito sigue igual.
4. Si intentas abrir *Mis pedidos* o el *Panel* sin sesión, se te pedirá iniciar sesión.

📷 PANTALLAZO 0a: inicio como invitado (barra con "Hola, invitado", Iniciar sesión y Crear cuenta)
📷 PANTALLAZO 0b: carrito como invitado con los botones "Crear cuenta y comprar" e "Iniciar sesión"

### 2.1 Iniciar sesión
1. Pulsa **Iniciar sesión** en la barra superior (o **Seguir como invitado** para volver a la tienda).
2. Escribe tu correo y contraseña y pulsa **Ingresar**.
3. Si los datos son incorrectos aparece *"Correo o contraseña incorrectos."*.

📷 PANTALLAZO 1: pantalla de inicio de sesión (con el recuadro de usuarios de prueba)
📷 PANTALLAZO 2: error de credenciales incorrectas

### 2.2 Crear una cuenta (clientes)
1. Pulsa **Crear cuenta** en la barra superior, **Regístrate aquí** en la pantalla de ingreso o **Crear cuenta y comprar** en el carrito.
2. Completa RUT (con dígito verificador válido), nombre, correo y una contraseña de al menos 8 caracteres con mayúscula, minúscula y número.
3. Pulsa **Crear mi cuenta**. Quedarás con la sesión iniciada como Cliente.

📷 PANTALLAZO 3: formulario de registro con un error de validación (ej: RUT inválido)

### 2.3 Tu sesión se mantiene
Si recargas la página o cierras la pestaña, **no tienes que volver a ingresar** (la sesión dura hasta 7 días). Verás un momento el mensaje *"Verificando sesión..."*. Para salir, pulsa **Cerrar sesión** en la barra superior: vuelves al inicio como invitado.

📷 PANTALLAZO 4: barra superior con "Hola, <nombre>" y el botón Cerrar sesión

---

## 3. Cliente

### 3.1 Ver el catálogo
1. Menú **Catálogo**. Filtra por categoría con los botones, busca por nombre/marca/modelo/código y ordena por precio o nombre.
2. Pulsa un producto para ver su detalle, stock disponible y elegir la cantidad.

📷 PANTALLAZO 5: catálogo con un filtro de categoría activo
📷 PANTALLAZO 6: detalle de un producto

### 3.2 Carrito
1. Pulsa **Agregar al carrito** en un producto. El ícono del carrito muestra cuántos productos llevas.
2. En el carrito puedes cambiar cantidades (hasta el stock disponible) o quitar productos.
3. Pulsa **Continuar con la compra**.

📷 PANTALLAZO 7: carrito con productos y total

### 3.3 Finalizar la compra
1. Completa nombre, correo y teléfono.
2. Elige **Despacho a domicilio** ($5.990, ingresa dirección y comuna) o **Retiro en tienda** (gratis, elige el punto de retiro).
3. Elige el medio de pago y pulsa **Confirmar pedido**.
4. Si otro cliente compró las últimas unidades, verás *"Stock insuficiente para …"* y no se cobrará nada.

📷 PANTALLAZO 8: checkout con retiro en tienda
📷 PANTALLAZO 9: mensaje de stock insuficiente (opcional)

### 3.4 Mis pedidos
Menú **Mis pedidos**: cada pedido muestra su número (SV-0001…), productos, total, forma de entrega, estado (En preparación → Despachado → Entregado) y N° de seguimiento.

📷 PANTALLAZO 10: "Mis pedidos" con el mensaje del pedido recién creado

### 3.5 Contacto
Menú **Contacto**: completa el formulario (nombre, correo, teléfono opcional, asunto y mensaje) y pulsa **Enviar mensaje**. Abajo está el mapa con la tienda y los puntos de retiro.

📷 PANTALLAZO 11: formulario de contacto enviado (alerta verde) y mapa

---

## 4. Vendedor

Al ingresar llegas a **Panel → Pedidos**.

### 4.1 Pedidos
1. Filtra por estado con el selector.
2. En cada pedido elige el nuevo estado, escribe el N° de seguimiento (si fue despachado) y pulsa **Guardar**.

📷 PANTALLAZO 12: panel de pedidos con un pedido actualizado

### 4.2 Inventario
Busca el producto, escribe el nuevo stock y pulsa **Guardar**. El interruptor **Mostrar solo stock crítico** lista los productos con 2 unidades o menos.

📷 PANTALLAZO 13: inventario con el filtro de stock crítico

### 4.3 Mensajes de contacto
**Panel → Contactos**: lista de mensajes con su estado. **Marcar atendido** cuando respondas al cliente; **Eliminar** pide confirmación.

📷 PANTALLAZO 14: panel de contactos (un pendiente y uno atendido)

### 4.4 Lo que el vendedor NO puede hacer
No ve "Productos" ni "Usuarios" en el panel, y si escribe esas direcciones aparece **Acceso denegado**.

📷 PANTALLAZO 15: "Acceso denegado" al entrar a /admin/usuarios como vendedor

---

## 5. Administrador

Al ingresar llegas a **Panel → Resumen**: ventas totales, pedidos por estado y productos con stock crítico.

📷 PANTALLAZO 16: resumen del panel

### 5.1 Productos
- **Crear**: completa el formulario de la izquierda (el código es 2 letras + 3 números, ej: AC011) y pulsa **Crear producto**.
- **Editar**: pulsa **Editar** en la tabla, cambia los datos y **Guardar cambios**.
- **Eliminar**: pulsa **Eliminar** y confirma.

📷 PANTALLAZO 17: producto creado (alerta verde) en la tabla
📷 PANTALLAZO 18: error "Ya existe un producto con el código ..."

### 5.2 Usuarios y roles
- **Crear** usuarios con cualquier rol.
- **Editar** datos y **asignar rol** (no puedes cambiar tu propio rol).
- **Desactivar / Activar** cuentas: una cuenta desactivada no puede ingresar y sus sesiones se cierran.

📷 PANTALLAZO 19: lista de usuarios con un usuario desactivado

---

## 6. Mensajes frecuentes

| Mensaje | Qué significa |
|---|---|
| *Verificando sesión...* | La tienda está comprobando tu sesión guardada |
| *Tu sesión expiró. Inicia sesión nuevamente.* | Pasaron más de 7 días o la cuenta se cerró desde el panel |
| *No tienes permisos para realizar esta acción.* | Tu rol no permite esa acción |
| *No se pudo conectar con el servidor…* | El servidor no responde; pulsa **Reintentar** en unos minutos |
| *Stock insuficiente para …* | Otro cliente compró antes; ajusta la cantidad en el carrito |
