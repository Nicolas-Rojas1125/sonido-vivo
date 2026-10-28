// Capa pequeña sobre localStorage.
// Todos los servicios guardan sus datos a través de este objeto, así:
//  1) si el navegador bloquea localStorage, la app sigue funcionando (try/catch)
//  2) en las pruebas se puede reemplazar (mock) con spyOn(almacenamiento, "leer")
//
// Cuando exista el backend Spring Boot (EP3), los servicios llamarán a la API REST
// en lugar de usar este almacenamiento local.

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
    productos: "sv_productos",
    usuarios: "sv_usuarios",
    pedidos: "sv_pedidos",
    sesion: "sv_sesion",
    carrito: "sv_carrito",
};
