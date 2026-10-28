import { useState } from "react";
import type { Producto } from "../../tipos/Producto";
import { colorEstadoStock, obtenerEstadoStock, textoEstadoStock } from "../../utilidades/stock";
import Boton from "../atomos/Boton";
import Input from "../atomos/Input";
import Insignia from "../atomos/Insignia";

type Props = {
    producto: Producto;
    alGuardar: (codigo: string, stock: number) => void;
};

// Fila con estado propio: el valor del input se maneja dentro del componente
// y recién al presionar "Guardar" se avisa al padre con la prop alGuardar.
function FilaInventario({ producto, alGuardar }: Props) {
    const [valor, setValor] = useState(String(producto.stock));
    const estado = obtenerEstadoStock(producto.stock);
    const esValido = /^[0-9]+$/.test(valor);
    const cambio = esValido && Number(valor) !== producto.stock;

    return (
        <tr className={estado === "agotado" ? "table-secondary" : estado === "pocas" ? "table-warning" : ""}>
            <td className="fw-semibold d-none d-sm-table-cell">{producto.codigo}</td>
            <td>
                {producto.nombre}
                <div className="small text-body-secondary d-sm-none">{producto.codigo}</div>
            </td>
            <td className="d-none d-sm-table-cell">
                <Insignia texto={textoEstadoStock[estado]} color={colorEstadoStock[estado]} />
            </td>
            <td style={{ minWidth: "5.5rem", width: "7rem" }}>
                <Input
                    tipo="number"
                    nombre={"stock-" + producto.codigo}
                    valor={valor}
                    min={0}
                    invalido={!esValido}
                    etiquetaAria={"Stock de " + producto.nombre}
                    alCambiar={setValor}
                />
            </td>
            <td className="text-end text-nowrap">
                <Boton
                    texto="Guardar"
                    tamano="sm"
                    variante="success"
                    deshabilitado={!cambio}
                    etiquetaAria={"Guardar stock de " + producto.nombre}
                    alClick={() => alGuardar(producto.codigo, Number(valor))}
                />
            </td>
        </tr>
    );
}
export default FilaInventario;
