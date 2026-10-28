import { tienda } from "../datos/tienda";
import CardInfo from "../componentes/moleculas/CardInfo";
import Hero from "../componentes/organismos/Hero";

const misionVision = [
    {
        titulo: "Misión",
        texto: "Acercar instrumentos, equipos de sonido y accesorios de calidad a músicos de todo Chile, con asesoría cercana y stock confiable.",
    },
    {
        titulo: "Visión",
        texto: "Ser la tienda musical de referencia de Santiago, tanto en el mesón como en línea.",
    },
];

// Imágenes en /public/imagenes/nosotros/
const equipo = [
    {
        titulo: "Asesoría de músicos",
        texto: "Nuestro equipo toca lo que vende: te ayudamos a elegir según tu estilo y presupuesto.",
        imagen: "/imagenes/nosotros/asesoria.jpg",
        alt: "Vendedor probando una guitarra con un cliente",
    },
    {
        titulo: "Taller de reparación",
        texto: "Reparamos y calibramos guitarras, bajos y otros instrumentos de cuerda.",
        imagen: "/imagenes/nosotros/taller.jpg",
        alt: "Taller de reparación de instrumentos",
    },
    {
        titulo: "Tienda física",
        texto: "Visítanos en el Edificio Dos Caracoles de Providencia y prueba los instrumentos antes de comprar.",
        imagen: "/imagenes/nosotros/tienda.jpg",
        alt: "Interior de la tienda Sonido Vivo",
    },
];

function Nosotros() {
    return (
        <>
            <Hero titulo="Nosotros" texto={tienda.aniosFuncionamiento + " años haciendo sonar a Santiago."} compacto />
            <div className="container py-4">
                <section className="mb-5">
                    <h2 className="h4">¿Quiénes somos?</h2>
                    <p>
                        {tienda.nombre} es una tienda especializada en instrumentos musicales, equipos de sonido y accesorios,
                        ubicada en el Edificio Dos Caracoles, en Providencia. Somos un equipo pequeño —el dueño y dos vendedores— que atiende a músicos
                        principiantes y profesionales. Hoy, además de la venta presencial, recibimos pedidos de clientes de
                        otras ciudades, y por eso creamos esta tienda online.
                    </p>
                </section>

                <section className="mb-5" aria-labelledby="titulo-mision">
                    <h2 id="titulo-mision" className="visually-hidden">
                        Misión y visión
                    </h2>
                    <div className="row row-cols-1 row-cols-md-2 g-4">
                        {misionVision.map((item) => (
                            <div className="col" key={item.titulo}>
                                <CardInfo titulo={item.titulo} texto={item.texto} />
                            </div>
                        ))}
                    </div>
                </section>

                <section aria-labelledby="titulo-equipo">
                    <h2 id="titulo-equipo" className="h4 mb-3">
                        Lo que nos distingue
                    </h2>
                    <div className="row row-cols-1 row-cols-md-3 g-4">
                        {equipo.map((item) => (
                            <div className="col" key={item.titulo}>
                                <CardInfo titulo={item.titulo} texto={item.texto} imagen={item.imagen} alt={item.alt} />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
export default Nosotros;
