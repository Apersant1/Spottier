import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import { useStores } from "../stores/useStores";
import { Spot, SpotRead } from "../stores/SpotsStore";
import "leaflet/dist/leaflet.css";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import {
  faFutbol,
  faBasketballBall,
  faTableTennis,
  faVolleyballBall,
  faHockeyPuck,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { renderToString } from "react-dom/server";
import { FloatingBottomBar } from "../components/BottomBar/FloatingBottomBar";

// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
// });

export const getCustomSportIcon = (sport: string) => {
  let icon = faQuestion;
  let bg = "bg-gray-400";

  switch (sport) {
    case "football":
      icon = faFutbol;
      bg = "bg-green-600";
      break;
    case "basketball":
      icon = faBasketballBall;
      bg = "bg-orange-600";
      break;
    case "tennis":
      icon = faTableTennis;
      bg = "bg-lime-600";
      break;
    case "volleyball":
      icon = faVolleyballBall;
      bg = "bg-blue-500";
      break;
    case "hockey":
      icon = faHockeyPuck;
      bg = "bg-gray-800";
      break;
    default:
      icon = faQuestion;
      bg = "bg-gray-400";
      break;
  }

  const iconHtml = renderToString(
    <div
      className={`w-10 h-10 ${bg} text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white`}
    >
      <FontAwesomeIcon icon={icon} size="2xl" />
    </div>,
  );

  return L.divIcon({
    html: iconHtml,
    className: "", // обязательно, чтобы Tailwind работал
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const sportTypes = ["football", "basketball", "tennis", "volleyball", "hockey"];

export const MapPage = observer(() => {
  const defaultPosition: LatLngExpression = [54.2, 45.1745]; // Saransk, Russia
  const { authStore, spotsStore } = useStores();
  const navigate = useNavigate();
  const [position, setPosition] = useState<LatLngExpression>(defaultPosition);
  const [activeUserMarkerPopup, setActiveUserMarkerPopup] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    country: "", // Можно сделать выбор страны
    sport_type: "",
  });
  const [creatingNewSpot, setCreatingNewSpot] = useState(false);
  const initialMarkerRef = useRef<{ lat: number; lng: number } | null>(null);
  const [markerPosition, setMarkerPosition] = useState<L.LatLng | null>(null);
  const [markerAddress, setMarkerAddress] = useState<string>("Загрузка...");
  const baseURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    // Загружаем все споты
    try {
      spotsStore.fetchSpots();
    } catch (error) {
      console.error("Ошибка при загрузке спотов:", error);
    }
  }, [spotsStore]);

  useEffect(() => {
    if (!markerPosition) {
      setMarkerAddress("");
      return;
    }
    setMarkerAddress("Загрузка...");

    spotsStore
      .translatLatLogToAddress(markerPosition.lat, markerPosition.lng)
      .then((addr) => {
        if (typeof addr === "string") {
          // Если ошибка, вернется строка
          setMarkerAddress(addr);
        } else {
          // Адрес успешно получен
          setMarkerAddress(addr.address || "Адрес не найден");
        }
      })
      .catch(() => {
        setMarkerAddress("Ошибка при загрузке адреса");
      });
  }, [markerPosition]);

  const ClickHandler = ({
    onClick,
  }: {
    onClick: (latlng: L.LatLng) => void;
  }) => {
    useMapEvents({
      click(e: any) {
        onClick(e.latlng);
      },
    });
    return null;
  };

  // const SetViewOnChange = ({
  //   center,
  //   zoom,
  // }: {
  //   center: LatLngExpression;
  //   zoom: number;
  // }) => {
  //   const map = useMap();

  //   useEffect(() => {
  //     map.setView(center, zoom);
  //   }, [center, zoom, map]);
  //   return null;
  // };

  const addSpot = async (spot: Spot) => {
    if (!newSpotCoords) return;
    if (!newSpotData.name.trim()) {
      alert("Название обязательно");
      return;
    }
    try {
      await spotsStore.addSpot({ ...newSpotData, ...newSpotCoords });

      setCustomSpots((prev) => [...prev]);
      setCreatingNewSpot(false);
      setMarkerPosition(null);
      spotsStore.fetchSpots(); // Обновляем список спотов
      initialMarkerRef.current = null; // Сбрасываем реф
      setNewSpotData({
        name: "",
        desc: "",
        sport_type: "",
        country: "",
      });
      setNewSpotCoords(null);
    } catch (error) {
      alert("Не удалось добавить площадку");
      console.error(error);
    }
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
        <MapContainer center={defaultPosition} zoom={15} className="flex-grow">
          {/* <SetViewOnChange center={position} zoom={15} /> */}
          <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />

          {/* Добавление площадки */}
          {authStore.user?.is_superuser && (
            <ClickHandler onClick={setMarkerPosition} />
          )}

          {markerPosition && (
            <Marker position={initialMarkerRef.current ?? markerPosition}>
              <Popup>
                {!creatingNewSpot ? (
                  <div className="max-w-md rounded-lg shadow-lg  text-sm font-sans">
                    <h2 className="text-xl font-bold mb-4 text-orange-500">
                      Добавить новую площадку
                    </h2>
                    <p className="mb-3">
                      <span className="font-semibold">Адрес:</span>{" "}
                      {markerAddress}
                    </p>
                    <button
                      onClick={() => {
                        initialMarkerRef.current = markerPosition;
                        setNewSpotCoords({
                          lat: markerPosition.lat,
                          lon: markerPosition.lng,
                        });
                        setNewSpotData({
                          name: "",
                          desc: "",
                          sport_type: "",
                          country: markerAddress,
                        });
                        setCreatingNewSpot(true);
                      }}
                      className="      mt-4 w-full
      px-4 py-2
      bg-orange-500
      text-white
      rounded-md
      font-semibold
      hover:bg-orange-600
      transition
      duration-300
      ease-in-out
      shadow-md
      focus:outline-none
      focus:ring-2
      focus:ring-orange-400
      focus:ring-offset-1
      select-none
    "
                    >
                      Создать площадку
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-700 w-64">
                    <h2 className="text-lg font-bold mb-2 text-orange-500">
                      Новая площадка
                    </h2>
                    <div className="mb-2">
                      <label className="block text-gray-600 text-sm mb-1">
                        Название
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded text-gray-800"
                        value={newSpotData.name}
                        onChange={(e) =>
                          setNewSpotData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-gray-600 text-sm mb-1">
                        Описание
                      </label>
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded text-gray-800"
                        rows={3}
                        value={newSpotData.desc}
                        placeholder="Введите адрес или описание площадки"
                        onChange={(e) =>
                          setNewSpotData((prev) => ({
                            ...prev,
                            desc: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-600 text-sm mb-1">
                        Адрес
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded text-gray-800"
                        value={markerAddress}
                        disabled={true}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-gray-600 text-sm mb-1">
                        Тип спорта
                      </label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded text-gray-800 bg-white"
                        value={newSpotData.sport_type}
                        onChange={(e) =>
                          setNewSpotData((prev) => ({
                            ...prev,
                            sport_type: e.target.value,
                          }))
                        }
                      >
                        <option value="">Выберите вид спорта</option>
                        {sportTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setCreatingNewSpot(false);
                          initialMarkerRef.current = null;
                          setMarkerPosition(null);
                        }}
                        className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={() => {
                          addSpot({
                            ...newSpotData,
                            lat: newSpotCoords?.lat ?? 0,
                            lon: newSpotCoords?.lon ?? 0,
                          });
                          setCreatingNewSpot(false);
                          setMarkerPosition(null);
                          spotsStore.fetchSpots(); // Обновляем список спотов
                          initialMarkerRef.current = null; // Сбрасываем реф
                          setNewSpotData({
                            name: "",
                            desc: "",
                            sport_type: "",
                            country: "",
                          });
                          setNewSpotCoords(null);
                        }}
                        className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                      >
                        Сохранить
                      </button>
                    </div>
                  </div>
                )}
              </Popup>
            </Marker>
          )}

          {/* Обработчик клика по карте */}
          {/* Watermark */}
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
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lon]}
              icon={getCustomSportIcon(spot?.sport_type || "football")}
            >
              <Popup>
                <div className="max-w-xs  rounded-lg shadow-lg text-gray-900 text-sm font-sans">
                  <h3 className="text-lg font-semibold mb-1 text-orange-500">
                    {spot.name}
                  </h3>
                  <p className="mb-1">{spot.desc}</p>
                  <p className="mb-2 italic text-gray-500">{spot.country}</p>
                  {/* {spot.sport_type && (
                    <p className="mb-3 font-medium text-gray-700">
                      Тип спорта: {spot.sport_type}
                    </p>
                  )} */}
                  <button
                    onClick={() => navigate(`/create-match?spot_id=${spot.id}`)}
                    className="
                            w-full
                            px-4 py-2
                            bg-orange-600
                            text-white
                            rounded-md
                            text-xs
                            font-semibold
                            hover:bg-blue-700
                            transition-colors
                            duration-200
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-400
                            focus:ring-offset-1
                            shadow
                            select-none
                          "
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
      {/* {newSpotCoords && (
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
                        country: "Россия", // Можно сделать выбор страны
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
      )} */}

      <FloatingBottomBar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </div>
  );
});
