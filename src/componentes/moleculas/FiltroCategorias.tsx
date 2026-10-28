import { categorias } from "../../datos/categorias";
import type { CategoriaFiltro } from "../../tipos/Producto";
import Boton from "../atomos/Boton";

type Props = {
    categoriaActiva: CategoriaFiltro;
    alSeleccionar: (categoria: CategoriaFiltro) => void;
};

function FiltroCategorias({ categoriaActiva, alSeleccionar }: Props) {
    return (
        <div className="d-flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
            <Boton
                texto="Todos"
                variante="filtro"
                tamano="sm"
                activo={categoriaActiva === "todos"}
                alClick={() => alSeleccionar("todos")}
            />
            {categorias.map((categoria) => (
                <Boton
                    key={categoria.valor}
                    texto={categoria.etiqueta}
                    variante="filtro"
                    tamano="sm"
                    activo={categoriaActiva === categoria.valor}
                    alClick={() => alSeleccionar(categoria.valor)}
                />
            ))}
        </div>
    );
}
export default FiltroCategorias;
