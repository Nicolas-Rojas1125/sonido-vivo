// Configuración de Karma (ejecutor de pruebas) + Jasmine (framework de pruebas).
//
// - Karma abre un navegador real (Chrome) y ejecuta ahí las pruebas.
// - Webpack + Babel compilan los archivos .ts/.tsx (TypeScript + JSX) antes de enviarlos al navegador.
// - babel-plugin-istanbul instrumenta el código fuente para medir la cobertura.
// - karma-coverage genera el reporte de cobertura en la carpeta /coverage.
//
// Comandos:
//   npm test            -> ejecuta todas las pruebas una vez en Chrome sin ventana (headless) y genera cobertura
//   npm run test:watch  -> abre Chrome visible y vuelve a ejecutar las pruebas cada vez que guardas un archivo

module.exports = function (config) {
    config.set({
        frameworks: ["jasmine", "webpack"],

        // Punto de entrada: un solo archivo que importa todas las pruebas (*.spec.ts / *.spec.tsx)
        files: [{ pattern: "src/test/indice-pruebas.ts", watched: false }],

        preprocessors: {
            "src/test/indice-pruebas.ts": ["webpack", "sourcemap"],
        },

        webpack: {
            mode: "development",
            devtool: "inline-source-map",
            resolve: {
                extensions: [".tsx", ".ts", ".jsx", ".js"],
            },
            module: {
                rules: [
                    {
                        test: /\.(ts|tsx|js|jsx)$/,
                        exclude: /node_modules/,
                        use: {
                            loader: "babel-loader",
                            options: {
                                presets: [
                                    ["@babel/preset-env", { targets: { chrome: "120" } }],
                                    ["@babel/preset-react", { runtime: "automatic" }],
                                    "@babel/preset-typescript",
                                ],
                                plugins: [
                                    [
                                        "istanbul",
                                        {
                                            // No se mide la cobertura de las propias pruebas ni del arranque de la app
                                            exclude: ["**/*.spec.ts", "**/*.spec.tsx", "src/test/**", "src/main.tsx"],
                                        },
                                    ],
                                ],
                            },
                        },
                    },
                    // Los CSS no se usan en las pruebas: se ignoran si algún componente los importa
                    { test: /\.css$/, type: "asset/source" },
                ],
            },
        },

        reporters: ["spec", "coverage"],

        specReporter: {
            suppressSkipped: true,
            showSpecTiming: false,
        },

        coverageReporter: {
            dir: "coverage/",
            subdir: ".",
            reporters: [
                { type: "html" },
                { type: "text-summary" },
                { type: "text", file: "cobertura.txt" },
                { type: "lcovonly" },
            ],
            check: {
                global: {
                    statements: 80,
                    branches: 70,
                    functions: 80,
                    lines: 80,
                },
            },
        },

        client: {
            jasmine: {
                random: false, // ejecuta las pruebas en orden, más fácil de seguir en la presentación
            },
        },

        // Chrome sin ventana; --no-sandbox permite ejecutarlo también en Linux/contenedores
        customLaunchers: {
            ChromeHeadlessSV: { base: "ChromeHeadless", flags: ["--no-sandbox"] },
        },
        browsers: ["ChromeHeadlessSV"],
        singleRun: true,
        autoWatch: true,
        browserNoActivityTimeout: 60000,
    });
};
