import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Home, Plus, User, MapPin, Volleyball, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStores } from "../../stores/useStores";

export const FloatingBottomBar = observer(() => {
  const navigate = useNavigate();
  const { teamsStore } = useStores();

  const [animationPhase, setAnimationPhase] = useState<
    "idle" | "fly" | "expand"
  >("idle");

  useEffect(() => {
    if (animationPhase === "expand") {
      const timer = setTimeout(() => {
        navigate("/main");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [animationPhase, navigate]);

  const handleClick = () => {
    if (animationPhase !== "idle") return;
    setAnimationPhase("fly");
    setTimeout(() => setAnimationPhase("expand"), 600);
  };

  // Навигация на страницу матчей с текущей командой пользователя
  const goToMatches = () => {
    if (teamsStore.currentTeam) {
      navigate(`/matches?teamId=${teamsStore.currentTeam.id}`);
    } else {
      // Если команда не выбрана — можно вывести предупреждение или перейти на страницу выбора команды
      navigate("/matches");
    }
  };

  // Анимации для кнопки
  const buttonVariants = {
    idle: {
      bottom: 20,
      left: "50%",
      x: "-50%",
      y: 0,
      scale: 1,
      borderRadius: "50%",
      width: 64,
      height: 64,
      position: "fixed" as const,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    fly: {
      bottom: "50%",
      left: "50%",
      x: "-50%",
      y: "50%",
      scale: 1.1,
      borderRadius: "50%",
      width: 64,
      height: 64,
      position: "fixed" as const,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    expand: {
      top: 0,
      left: 0,
      x: 0,
      y: 0,
      width: "100vw",
      height: "100vh",
      scale: 1,
      borderRadius: 0,
      position: "fixed" as const,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  // Анимации для bottom bar
  const barVariants = {
    idle: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    fly: {
      y: 100,
      opacity: 0,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    expand: {
      y: 100,
      opacity: 0,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  return (
    <>
      {/* Bottom Bar */}
      <AnimatePresence>
        {animationPhase === "idle" && (
          <motion.div
            initial="idle"
            animate="idle"
            exit="fly"
            variants={barVariants}
            className="fixed bottom-5 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2"
          >
            <div className="relative bg-gray-900/95 backdrop-blur-sm shadow-xl rounded-3xl flex justify-between items-center px-6 py-4">
              {/* Левая часть */}
              <div className="flex gap-6 sm:gap-6 md:gap-7 lg:gap-8 xl:gap-12">
                <NavItem
                  icon={<Users size={22} />}
                  label="Команда"
                  onClick={() => {
                    if (teamsStore.currentTeam) {
                      navigate(`/teams/${teamsStore.currentTeam.id}`);
                    } else {
                      navigate("/teams");
                    }
                  }}
                />
                <NavItem
                  icon={<MapPin size={22} />}
                  label="Карта"
                  onClick={() => navigate("/map")}
                />
              </div>
              {/* Правая часть */}
              <div className="flex gap-6">
                <NavItem
                  icon={<User size={22} />}
                  label="Профиль"
                  onClick={() => navigate("/profile")}
                />
                <NavItem
                  icon={<Volleyball size={22} />}
                  label="Матчи"
                  onClick={goToMatches}
                />
              </div>

              {/* Центральная кнопка на панели */}
              <div className="absolute left-1/2 -top-7 -translate-x-1/2 z-10">
                <button
                  onClick={handleClick}
                  className="w-16 h-16 rounded-full bg-orange-500 text-white shadow-xl border-4 border-gray-900 flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-110 hover:bg-orange-600"
                  aria-label="Открыть главную"
                >
                  <Plus size={30} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Плавающая кнопка в фазах fly и expand */}
      {(animationPhase === "fly" || animationPhase === "expand") && (
        <motion.button
          aria-label="Анимация кнопки"
          disabled
          variants={buttonVariants}
          initial="idle"
          animate={animationPhase}
          exit="idle"
          className="z-50 bg-gray-900 text-white shadow-xl  flex items-center justify-center cursor-default"
        >
          {animationPhase === "expand" ? (
            <img src="/logo.svg" alt="" />
          ) : (
            <Plus size={30} />
          )}
        </motion.button>
      )}
    </>
  );
});

const NavItem = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex flex-col min-w-[30px] items-center text-xs text-gray-300 transition-all duration-300 ease-in-out hover:text-orange-400 hover:scale-105 hover:bg-gray-800 rounded-lg p-2"
  >
    {icon}
    <span className="mt-1">{label}</span>
  </button>
);

// Этот компонент представляет собой плавающую нижнюю панель навигации с иконками и кнопкой добавления.
// Он использует Lucide иконки для навигационных элементов и стилизован с помощью Tailwind CSS.
// Компонент NavItem используется для создания отдельных элементов навигации с иконками и текстом.
// Компонент FloatingBottomBar содержит основную логику и структуру панели, включая стилизацию и позиционирование.
// Он фиксируется внизу экрана и адаптируется под разные размеры экранов.
// Компонент можно использовать в любом месте приложения, где требуется плавающая навигационная панель.
