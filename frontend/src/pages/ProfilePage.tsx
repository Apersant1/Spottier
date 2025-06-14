"use client";
import { useEffect, useState } from "react";
import { useStores } from "../stores/useStores";
import { parseInitData } from "../utils/parseInitData.ts";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export const ProfilePage = () => {
  const { authStore } = useStores();
  const [avatarUrl, SetAvatarUrl] = useState("");
  const [email, setEmail] = useState(
    authStore.user ? authStore.user.email : "",
  );
  const [emailChanged, setEmailChanged] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    setIsButtonDisabled(!emailChanged);
  }, [emailChanged]);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setEmailChanged(event.target.value !== authStore.user?.email);
  };

  const handleUpdateProfile = async () => {
    try {
      await authStore.update({ email });
      setEmailChanged(false);
      setIsButtonDisabled(true);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Шапка с кнопкой назад */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <button
            className="flex items-center text-orange-600 bg-gray-100 rounded-3xl p-3  transition-colors"
            onClick={() => window.history.back()}
          >
            <span className="font-medium">Назад к карте</span>
          </button>
        </div>
      </header>

      {/* Основное содержимое */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md overflow-hidden p-6"
        >
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Мой профиль</h1>
            <p className="text-gray-500 mt-2">
              Управляйте вашими персональными данными
            </p>
          </div>

          {/* Аватар */}
          <div className="flex flex-col items-center mb-8 justify-center ">
            <div className="relative group flex flex-col items-center">
              <img
                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                src={avatarUrl}
                alt=""
              />
              <div className="avatar mt-5 ">Аватар</div>
            </div>
          </div>

          {/* Форма профиля */}
          <div className="space-y-6">
            {/* Поле имени пользователя */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя пользователя
              </label>
              <input
                type="text"
                value={authStore.user?.username || ""}
                disabled
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Поле email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Электронная почта
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Введите ваш email"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Кнопка сохранения */}
            <div className="pt-4">
              <motion.button
                onClick={handleUpdateProfile}
                disabled={isButtonDisabled}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  isButtonDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                }`}
              >
                Сохранить изменения
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
