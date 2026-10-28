// Punto de entrada de Karma: busca y carga TODOS los archivos *.spec.ts / *.spec.tsx dentro de /src.
// require.context es una función de Webpack (el empaquetador que usa Karma).
declare const require: {
    context(
        directorio: string,
        subcarpetas: boolean,
        patron: RegExp
    ): { keys(): string[]; (id: string): unknown };
};

const pruebas = require.context("../", true, /\.spec\.tsx?$/);
pruebas.keys().forEach(pruebas);
