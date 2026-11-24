// Capa pequeña sobre localStorage.
// Desde la integración con el backend SOLO se usa para el carrito (no es información sensible).
// Productos, usuarios, pedidos y contactos viven en MySQL (microservicios Spring Boot) y la
// sesión se maneja con JWT en memoria + refresh token en cookie httpOnly.
//  1) si el navegador bloquea localStorage, la app sigue funcionando (try/catch)
//  2) en las pruebas se puede reemplazar (mock) con spyOn(almacenamiento, "leer")

export const almacenamiento = {
    leer<T>(clave: string, porDefecto: T): T {
        try {
            const texto = window.localStorage.getItem(clave);
            return texto ? (JSON.parse(texto) as T) : porDefecto;
        } catch {
            return porDefecto;
        }
    },

    guardar<T>(clave: string, valor: T): void {
        try {
            window.localStorage.setItem(clave, JSON.stringify(valor));
        } catch {
            // Si no se puede guardar, los datos quedan solo en memoria
        }
    },

    eliminar(clave: string): void {
        try {
            window.localStorage.removeItem(clave);
        } catch {
            // nada que hacer
        }
    },
};

export const CLAVES = {
    carrito: "sv_carrito",
};
