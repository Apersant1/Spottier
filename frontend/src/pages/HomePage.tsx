import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="font-sans  bg-gray-900">
      {/* Hero Section */}
      <section className="min-h-screen  bg-gray-900 flex flex-col items-center justify-center text-white text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold mb-4 text-orange-500"
        >
          Spottier
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-xl mb-6"
        >
          Найди матч. Найди площадку. Найди свою игру.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => navigate("/login")}
          className="bg-white text-orange-500 font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-gray-100"
        >
          Присоединиться
        </motion.button>
      </section>

      {/* Map Section */}
      <section className="py-12 px-4 lg:px-16 bg-gray-50">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Популярные площадки
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96">
            <MapContainer
              center={[55.751244, 37.618423]}
              zoom={10}
              className="w-full h-full rounded-2xl shadow"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker position={[55.751244, 37.618423]}>
                <Popup>Площадка в центре Москвы</Popup>
              </Marker>
            </MapContainer>
          </div>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-lg font-semibold">Центральный стадион</h3>
              <p className="text-sm text-gray-600">Москва, ул. Примерная, 1</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-lg font-semibold">Парковая площадка</h3>
              <p className="text-sm text-gray-600">Москва, Парк Горького</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">
          Что умеет Spottier
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
          {[
            {
              title: "Поиск площадок",
              desc: "Фильтрация по городу, типу, длительности, стоимости и др.",
            },
            {
              title: "Создание матчей",
              desc: "Регистрируй команды и проводи матчи на любых площадках.",
            },
            {
              title: "Работа с геоданными",
              desc: "Добавляй площадки и смотри их расположение на карте.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.4, delay: i * 0.2 }}
              className="bg-gray-100 p-6 rounded-xl shadow hover:shadow-md"
            >
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-16 px-4 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">
          Как это работает
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-8 text-center">
          {["Зарегистрируйся", "Найди", "Играй"].map((step, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="bg-white rounded-xl p-6 shadow w-full max-w-sm"
            >
              <div className="text-4xl font-bold text-orange-500 mb-2">
                {i + 1}
              </div>
              <div className="text-lg font-semibold">{step}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-orange-500 text-white text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Готов сыграть?</h2>
        <p className="mb-6 text-lg">
          Создай свой матч прямо сейчас и зови друзей!
        </p>
        <button className="bg-white text-gray-900 font-semibold py-3 px-6 rounded-full hover:bg-gray-100 shadow-lg">
          Создать матч
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 text-center">
        <p>© {new Date().getFullYear()} Spottier. Все права защищены.</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:underline">
            Контакты
          </a>
          <a href="#" className="hover:underline">
            Соцсети
          </a>
          <a href="#" className="hover:underline">
            Политика конфиденциальности
          </a>
        </div>
      </footer>
    </div>
  );
}
