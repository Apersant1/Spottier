import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapLocationDot,
  faUserCircle,
  faScrewdriverWrench,
} from "@fortawesome/free-solid-svg-icons";
import { useStores } from "../../stores/useStores";

export const Header = observer(() => {
  const { authStore } = useStores();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // блокируем скролл при открытом меню
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (!authStore.isAuthenticated) return null;

  return (
    <header className="bg-white shadow-md py-4 px-4 sm:px-10 min-h-[70px] relative z-50">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Логотип */}
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="logo" className="w-10 sm:w-12 md:w-14" />
        </Link>

        {/* Меню для десктопа */}
        <nav className="hidden lg:flex space-x-10 items-center">
          <Link
            to="/map"
            className="flex items-center gap-2 text-blue-700 font-medium hover:text-blue-900"
          >
            <FontAwesomeIcon icon={faMapLocationDot} />
            Карта
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-2 text-gray-900 font-medium hover:text-blue-700"
          >
            <FontAwesomeIcon icon={faUserCircle} />
            {authStore.user?.username}
          </Link>

          {authStore.user?.is_superuser && (
            <Link
              to="/admin"
              className="flex items-center gap-2 text-gray-900 font-medium hover:text-blue-700"
            >
              <FontAwesomeIcon icon={faScrewdriverWrench} />
              Админ панель
            </Link>
          )}

          <button
            onClick={() => authStore.logout()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 transition-transform hover:scale-105"
          >
            <LogOut size={18} />
            Выйти
          </button>
        </nav>

        {/* Кнопка меню для мобилок */}
        <button
          className="lg:hidden flex items-center justify-center p-2 rounded-md hover:bg-gray-200 transition"
          onClick={() => setMenuOpen(true)}
          aria-label="Открыть меню"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Мобильное меню (оверлей + панель) */}
        {menuOpen && (
          <>
            {/* Полупрозрачный фон */}
            <div
              className="fixed inset-0 bg-black opacity-50 z-40"
              onClick={() => setMenuOpen(false)}
            />

            {/* Само меню */}
            <div
              ref={menuRef}
              className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg p-6 z-50 flex flex-col"
            >
              {/* Кнопка закрытия */}
              <button
                className="self-end mb-6 text-gray-700 hover:text-gray-900 text-3xl font-bold"
                onClick={() => setMenuOpen(false)}
                aria-label="Закрыть меню"
              >
                ×
              </button>

              <nav className="flex flex-col gap-6">
                <Link
                  to="/map"
                  className="flex items-center gap-3 text-blue-700 font-medium hover:text-blue-900"
                  onClick={() => setMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faMapLocationDot} />
                  Карта
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 text-gray-900 font-medium hover:text-blue-700"
                  onClick={() => setMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={faUserCircle} />
                  {authStore.user?.username}
                </Link>

                {authStore.user?.is_superuser && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 text-gray-900 font-medium hover:text-blue-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faScrewdriverWrench} />
                    Админ панель
                  </Link>
                )}

                <button
                  onClick={() => {
                    authStore.logout();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 transition-transform hover:scale-105"
                >
                  <LogOut size={18} />
                  Выйти
                </button>
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  );
});
