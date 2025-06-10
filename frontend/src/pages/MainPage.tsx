import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useStores } from "../stores/useStores";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faUsers,
  faFutbol,
  faUsersCog,
  faMapMarkedAlt,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { SizeProp } from "@fortawesome/fontawesome-svg-core";
import { observer } from "mobx-react-lite";
import { match } from "assert";

const statsData = [
  { label: "Всего сообщений", value: 123, icon: faComments },
  { label: "Активных пользователей", value: 8, icon: faUsers },
  { label: "Проведено матчей", value: 56, icon: faFutbol },
  { label: "Новых команд", value: 5, icon: faUsersCog },
  { label: "Зарегистрировано площадок", value: 12, icon: faMapMarkedAlt },
];

const speedPxPerSec = 120;

const StatsCarousel: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  React.useEffect(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const contentWidth = containerWidth * 2;
    const duration = contentWidth / speedPxPerSec;

    controls.start({
      x: [-containerWidth, 0],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration,
          ease: "linear",
        },
      },
    });
  }, [controls]);

  // Дублируем данные для бесконечной карусели
  const allStats = [...statsData, ...statsData];

  return (
    <div
      ref={containerRef}
      className="overflow-hidden w-full mb-8 select-none font-orbitron text-white bg-gray-900 rounded-xl mr-10"
    >
      <motion.div
        animate={controls}
        className="flex gap-5 px-5 will-change-transform"
      >
        {allStats.map((stat, i) => (
          <motion.div
            key={i}
            whileHover="hover"
            initial="rest"
            animate="rest"
            variants={{
              rest: {
                scale: 1,
                boxShadow: "0 4px 14px rgba(249, 115, 22, 0.5)",
              },
              hover: {
                scale: 1.05,
                boxShadow: "0 8px 24px rgba(249, 115, 22, 0.7)",
              },
            }}
            className="bg-gradient-to-tr from-orange-500 to-orange-800 rounded-2xl
                       p-6 min-w-[200px] sm:min-w-[250px] md:min-w-[300px]
                       flex flex-col items-center text-center cursor-default"
          >
            <div className="mb-4 text-white drop-shadow-md text-3xl sm:text-4xl">
              <FontAwesomeIcon icon={stat.icon} />
            </div>
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-none
                           text-white select-text drop-shadow-lg"
            >
              {stat.value}
            </h2>
            <p className="mt-2 text-base sm:text-lg font-semibold uppercase tracking-wide select-text">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const MainPage: React.FC = () => {
  const { teamsStore, matchesStore } = useStores();
  return (
    <div className="w-screen mx-auto p-4 sm:p-6 font-orbitron bg-gray-900 min-h-screen text-white">
      <div className="flex gap-3 items-center mb-8 sm:mb-12">
        <button
          className="mb-6 sm:mb-10 gap-2"
          onClick={() => window.history.back()}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h3
          className="mb-6 sm:mb-10 font-semibold text-xl sm:text-4xl md:text-5xl
                     text-orange-500 drop-shadow-lg"
        >
          Главная страница
        </h3>
      </div>

      <StatsCarousel />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-gray-200">
        <UpcomingMatches />
        <SportsFacilities />
      </div>
    </div>
  );
};

const TeamManagement: React.FC = () => (
  <section className="bg-orange-500 p-4 rounded-xl shadow-lg select-none">
    <h3 className="text-xl mb-3 font-semibold text-white">Команды</h3>
    <ul className="list-none p-0 text-white text-base">
      <li className="mb-3 flex items-center">
        Команда 1
        <button
          className="ml-3 bg-white text-orange-600 rounded-md px-3 py-1 text-sm font-semibold
                           hover:bg-orange-100 transition"
        >
          Редактировать
        </button>
        <button
          className="ml-2 bg-white text-orange-600 rounded-md px-3 py-1 text-sm font-semibold
                           hover:bg-orange-100 transition"
        >
          Удалить
        </button>
      </li>
      <li className="mb-3 flex items-center">
        Команда 2
        <button
          className="ml-3 bg-white text-orange-600 rounded-md px-3 py-1 text-sm font-semibold
                           hover:bg-orange-100 transition"
        >
          Редактировать
        </button>
        <button
          className="ml-2 bg-white text-orange-600 rounded-md px-3 py-1 text-sm font-semibold
                           hover:bg-orange-100 transition"
        >
          Удалить
        </button>
      </li>
    </ul>
    <button
      className="mt-4 bg-white text-orange-600 rounded-lg px-5 py-2 font-bold
                       hover:bg-orange-100 transition"
    >
      Добавить команду
    </button>
  </section>
);

const UpcomingMatches: React.FC = observer(() => {
  const { matchesStore, teamsStore } = useStores();
  useEffect(() => {
    matchesStore.fetchMatches();
    teamsStore.FetchTeams();
  });
  const getTeamName = (id: string) =>
    teamsStore.teams.find((t) => t.id === id)?.name || "Неизвестная команда";

  return (
    <section className="bg-gray-700 p-4 rounded-xl shadow-lg select-none">
      <h3 className="text-xl mb-3 font-semibold text-white">Ближайшие матчи</h3>
      <ul className="text-white text-base list-disc list-inside">
        {matchesStore.matches.map((match, index) => (
          <li key={index}>
            {getTeamName(match.team_first_id)} vs{" "}
            {getTeamName(match.team_second_id)} —{" "}
            {new Date(match.registered_at).toLocaleString("ru-RU", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </li>
        ))}
      </ul>
    </section>
  );
});

const SportsFacilities: React.FC = () => (
  <section className="bg-gray-600 p-4 rounded-xl shadow-lg select-none">
    <h3 className="text-xl mb-3 font-semibold text-white">
      Спортивные площадки
    </h3>
    <ul className="text-white text-base list-disc list-inside">
      <li>Площадка А — Адрес, 10</li>
      <li>Площадка Б — Адрес, 25</li>
    </ul>
    <button
      className="mt-4 bg-white text-gray-800 rounded-lg px-5 py-2 font-bold
                       hover:bg-gray-200 transition"
    >
      Добавить площадку
    </button>
  </section>
);

export default MainPage;
