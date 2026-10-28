import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { PuntoRetiro } from "../../datos/tienda";
import { urlComoLlegar } from "../../utilidades/mapa";

type Props = {
    puntos: PuntoRetiro[];
    centro: [number, number];
};

// Mapa interactivo (Leaflet + OpenStreetMap) con la tienda y los puntos de retiro.
// Al lado se muestra la misma información como lista, para que sea accesible.
function MapaTiendas({ puntos, centro }: Props) {
    return (
        <div className="row g-4">
            <div className="col-12 col-lg-8">
                <MapContainer center={centro} zoom={12} scrollWheelZoom={false} className="mapa-tiendas rounded-3">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {puntos.map((punto) => (
                        <CircleMarker
                            key={punto.id}
                            center={punto.coordenadas}
                            radius={punto.id === "tienda" ? 12 : 9}
                            pathOptions={{ color: "#1d1b26", fillColor: punto.id === "tienda" ? "#e4572e" : "#f2b134", fillOpacity: 0.9 }}
                        >
                            <Popup>
                                <strong>{punto.nombre}</strong>
                                <br />
                                {punto.direccion}
                                <br />
                                <a href={urlComoLlegar(punto.coordenadas)} target="_blank" rel="noreferrer">
                                    Cómo llegar
                                </a>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>
            <div className="col-12 col-lg-4">
                <ul className="list-group">
                    {puntos.map((punto) => (
                        <li key={punto.id} className="list-group-item">
                            <h3 className="h6 mb-1">{punto.nombre}</h3>
                            <p className="small mb-1">{punto.direccion}</p>
                            <p className="small text-body-secondary mb-1">{punto.horario}</p>
                            <a className="small" href={urlComoLlegar(punto.coordenadas)} target="_blank" rel="noreferrer">
                                Cómo llegar →
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
export default MapaTiendas;
