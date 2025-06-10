import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import { useStores } from "../stores/useStores";
import { SpotRead } from "../stores/SpotsStore";
import "leaflet/dist/leaflet.css";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { FloatingBottomBar } from "../components/BottomBar/FloatingBottomBar";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const SetViewOnChange = ({
  center,
  zoom,
}: {
  center: LatLngExpression;
  zoom: number;
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const MapPage = observer(() => {
  const defaultPosition: LatLngExpression = [55.751244, 37.618423]; // Москва
  const { authStore, spotsStore } = useStores();
  const navigate = useNavigate();
  const [position, setPosition] = useState<LatLngExpression>(defaultPosition);
  const [activeUserMarkerPopup, setActiveUserMarkerPopup] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Для новых запросов:
  const [radiusKm, setRadiusKm] = useState(5);
  const [spotsInRadius, setSpotsInRadius] = useState<SpotRead[]>([]);
  const [nearestSpot, setNearestSpot] = useState<SpotRead | null>(null);
  const [loadingRadius, setLoadingRadius] = useState(false);
  const [loadingNearest, setLoadingNearest] = useState(false);

  // Маркеры, добавленные суперюзером
  const [customSpots, setCustomSpots] = useState<SpotRead[]>([]);

  // Координаты клика и данные новой площадки для формы
  const [newSpotCoords, setNewSpotCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [newSpotData, setNewSpotData] = useState({
    name: "",
    desc: "",
    sport_type: "",
  });

  const baseURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!navigator.geolocation) return;

    // Отслеживаем позицию пользователя
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos: LatLngExpression = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setPosition(newPos);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setPosition(defaultPosition);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      },
    );

    // Загружаем все споты
    spotsStore.fetchSpots();

    return () => navigator.geolocation.clearWatch(watchId);
  }, [spotsStore]);

  // Обработчик клика по карте — открываем форму, если суперюзер
  const onMapClick = (e: L.LeafletMouseEvent) => {
    if (!authStore.user?.is_superuser) return;

    setNewSpotCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
    setNewSpotData({ name: "", desc: "", sport_type: "" });
  };

  return (
    <div className="relative h-screen w-screen bg-gradient-to-br bg-gray-900/95 p-2">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className="relative z-10 h-[97vh] rounded-xl overflow-hidden shadow-xl border border-gray-300 flex flex-col">
        <MapContainer
          center={position}
          zoom={15}
          className="flex-grow"
          whenCreated={(map) => {
            map.on("click", onMapClick);
          }}
        >
          <SetViewOnChange center={position} zoom={15} />
          <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
          <div className="absolute top-2 right-2 z-[1000]">
            <span className="text-xl font-barlow  text-white px-3 py-1  watermark">
              Spottier
            </span>
          </div>
          {/* Маркер пользователя */}
          <Marker position={position}>
            {activeUserMarkerPopup && (
              <Popup onClose={() => setActiveUserMarkerPopup(false)}>
                <div className="text-sm text-gray-700">
                  📍 Ваше местоположение <br />
                  <strong>Lat:</strong>{" "}
                  {(position as [number, number])[0].toFixed(5)} <br />
                  <strong>Lng:</strong>{" "}
                  {(position as [number, number])[1].toFixed(5)}
                </div>
              </Popup>
            )}
          </Marker>

          {/* Все споты из spotsStore */}
          {spotsStore.spots.map((spot) => (
            <Marker key={spot.id} position={[spot.lat, spot.lon]}>
              <Popup>
                <div className="text-sm">
                  <strong>{spot.name}</strong>
                  <br />
                  {spot.desc}
                  <br />
                  <em>{spot.country}</em>
                  {spot.sport_type && <div>Тип спорта: {spot.sport_type}</div>}
                  <button
                    onClick={() => navigate(`/create-match?spot_id=${spot.id}`)}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                  >
                    Создать матч
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Маркеры, добавленные суперюзером */}
          {customSpots.map((spot) => (
            <Marker
              key={"custom_" + spot.id}
              position={[spot.lat, spot.lon]}
              icon={
                new L.Icon({
                  iconUrl:
                    "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowUrl:
                    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                  shadowSize: [41, 41],
                })
              }
            >
              <Popup>
                <div>
                  <strong>{spot.name}</strong> (Добавлено вами)
                  <br />
                  {spot.desc}
                  <br />
                  <em>{spot.country}</em>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Форма создания новой площадки */}
      {newSpotCoords && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded p-4 w-80">
            <h2 className="text-lg font-bold mb-2">Новая площадка</h2>
            <label className="block mb-2">
              Название:
              <input
                type="text"
                className="border p-1 w-full"
                value={newSpotData.name}
                onChange={(e) =>
                  setNewSpotData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </label>
            <label className="block mb-2">
              Описание:
              <textarea
                className="border p-1 w-full"
                value={newSpotData.desc}
                onChange={(e) =>
                  setNewSpotData((prev) => ({ ...prev, desc: e.target.value }))
                }
              />
            </label>
            <label className="block mb-4">
              Тип спорта:
              <input
                type="text"
                className="border p-1 w-full"
                value={newSpotData.sport_type}
                onChange={(e) =>
                  setNewSpotData((prev) => ({
                    ...prev,
                    sport_type: e.target.value,
                  }))
                }
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-300 rounded"
                onClick={() => setNewSpotCoords(null)}
              >
                Отмена
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={async () => {
                  if (!newSpotCoords) return;
                  if (!newSpotData.name.trim()) {
                    alert("Название обязательно");
                    return;
                  }
                  try {
                    const response = await fetch(`${baseURL}/spots`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authStore.access_token}`,
                      },
                      body: JSON.stringify({
                        lat: newSpotCoords.lat,
                        lon: newSpotCoords.lon,
                        name: newSpotData.name,
                        desc: newSpotData.desc,
                        sport_type: newSpotData.sport_type,
                      }),
                    });
                    if (!response.ok)
                      throw new Error("Ошибка при добавлении площадки");
                    const createdSpot: SpotRead = await response.json();

                    setCustomSpots((prev) => [...prev, createdSpot]);
                    setNewSpotCoords(null);
                  } catch (error) {
                    alert("Не удалось добавить площадку");
                    console.error(error);
                  }
                }}
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      <FloatingBottomBar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </div>
  );
});
