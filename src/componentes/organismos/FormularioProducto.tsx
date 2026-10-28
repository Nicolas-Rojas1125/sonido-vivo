import { useState } from "react";
import type { SubmitEvent } from "react";
import { categorias } from "../../datos/categorias";
import type { ErroresProducto, FormularioProductoDatos, Producto } from "../../tipos/Producto";
import { esCategoria, tieneErrores, validarProducto } from "../../utilidades/validaciones";
import Boton from "../atomos/Boton";
import CampoAreaTexto from "../moleculas/CampoAreaTexto";
import CampoFormulario from "../moleculas/CampoFormulario";
import CampoSelector from "../moleculas/CampoSelector";

type Props = {
    productoInicial?: Producto;
    alGuardar: (producto: Producto) => void;
    alCancelar?: () => void;
};

const datosVacios: FormularioProductoDatos = {
    codigo: "",
    categoria: "",
    nombre: "",
    marca: "",
    modelo: "",
    stock: "",
    precio: "",
    descripcion: "",
};

const opcionesCategoria = categorias.map((categoria) => ({
    valor: categoria.valor,
    etiqueta: categoria.titulo + " (" + categoria.prefijo + ")",
}));

function aFormulario(producto: Producto): FormularioProductoDatos {
    return {
        codigo: producto.codigo,
        categoria: producto.categoria,
        nombre: producto.nombre,
        marca: producto.marca,
        modelo: producto.modelo,
        stock: String(producto.stock),
        precio: String(producto.precio),
        descripcion: producto.descripcion,
    };
}

function FormularioProducto({ productoInicial, alGuardar, alCancelar }: Props) {
    const esEdicion = productoInicial !== undefined;
    const [datos, setDatos] = useState<FormularioProductoDatos>(
        productoInicial ? aFormulario(productoInicial) : datosVacios
    );
    const [errores, setErrores] = useState<ErroresProducto>({});

    const cambiar = (campo: keyof FormularioProductoDatos) => (valor: string) => {
        setDatos({ ...datos, [campo]: campo === "codigo" ? valor.toUpperCase() : valor });
    };

    const manejarEnvio = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const nuevosErrores = validarProducto(datos);
        setErrores(nuevosErrores);

        if (tieneErrores(nuevosErrores) || !esCategoria(datos.categoria)) {
            return;
        }

        const codigo = datos.codigo.trim();
        alGuardar({
            codigo,
            categoria: datos.categoria,
            nombre: datos.nombre.trim(),
            marca: datos.marca.trim(),
            modelo: datos.modelo.trim(),
            stock: Number(datos.stock),
            precio: Number(datos.precio),
            descripcion: datos.descripcion.trim(),
            // La imagen siempre se busca por el código: /public/imagenes/productos/CODIGO.jpg
            imagen: productoInicial?.imagen ?? "/imagenes/productos/" + codigo + ".jpg",
        });

        if (!esEdicion) {
            setDatos(datosVacios);
        }
    };

    return (
        <form onSubmit={manejarEnvio} noValidate aria-label="Formulario de producto">
            <h2 className="h5 mb-3">{esEdicion ? "Editar producto " + productoInicial.codigo : "Nuevo producto"}</h2>
            <div className="row">
                <div className="col-12 col-sm-5">
                    {esEdicion ? (
                        <div className="mb-3">
                            <span className="form-label d-block">Código</span>
                            <span className="form-control-plaintext fw-semibold">{datos.codigo}</span>
                        </div>
                    ) : (
                        <CampoFormulario
                            etiqueta="Código"
                            tipo="text"
                            nombre="codigo"
                            valor={datos.codigo}
                            alCambiar={cambiar("codigo")}
                            error={errores.codigo}
                            placeholder="Ej: GA006"
                        />
                    )}
                </div>
                <div className="col-12 col-sm-7">
                    <CampoSelector
                        etiqueta="Categoría"
                        nombre="categoria"
                        valor={datos.categoria}
                        opciones={opcionesCategoria}
                        alCambiar={cambiar("categoria")}
                        error={errores.categoria}
                    />
                </div>
            </div>
            <CampoFormulario
                etiqueta="Nombre"
                tipo="text"
                nombre="nombre"
                valor={datos.nombre}
                alCambiar={cambiar("nombre")}
                error={errores.nombre}
            />
            <div className="row">
                <div className="col-12 col-sm-6">
                    <CampoFormulario
                        etiqueta="Marca"
                        tipo="text"
                        nombre="marca"
                        valor={datos.marca}
                        alCambiar={cambiar("marca")}
                        error={errores.marca}
                    />
                </div>
                <div className="col-12 col-sm-6">
                    <CampoFormulario
                        etiqueta="Modelo"
                        tipo="text"
                        nombre="modelo"
                        valor={datos.modelo}
                        alCambiar={cambiar("modelo")}
                        error={errores.modelo}
                    />
                </div>
                <div className="col-6">
                    <CampoFormulario
                        etiqueta="Precio (CLP)"
                        tipo="number"
                        nombre="precio"
                        valor={datos.precio}
                        alCambiar={cambiar("precio")}
                        error={errores.precio}
                    />
                </div>
                <div className="col-6">
                    <CampoFormulario
                        etiqueta="Stock"
                        tipo="number"
                        nombre="stock"
                        valor={datos.stock}
                        alCambiar={cambiar("stock")}
                        error={errores.stock}
                    />
                </div>
            </div>
            <CampoAreaTexto
                etiqueta="Descripción breve"
                nombre="descripcion"
                valor={datos.descripcion}
                alCambiar={cambiar("descripcion")}
                error={errores.descripcion}
                filas={3}
            />
            <div className="d-flex flex-wrap gap-2">
                <Boton texto={esEdicion ? "Guardar cambios" : "Crear producto"} tipo="submit" />
                {alCancelar && <Boton texto="Cancelar" variante="outline-secondary" alClick={alCancelar} />}
            </div>
        </form>
    );
}
export default FormularioProducto;
