type Props = {
    id?: string;
    texto?: string;
};

// Muestra el error de validación debajo de un campo. Si no hay texto, no muestra nada.
function MensajeError({ id, texto }: Props) {
    if (!texto) {
        return null;
    }
    return (
        <div id={id} className="invalid-feedback d-block">
            {texto}
        </div>
    );
}
export default MensajeError;
