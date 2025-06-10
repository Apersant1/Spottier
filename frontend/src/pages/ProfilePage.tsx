"use client";
import { useEffect, useState } from "react";
import { useStores } from "../stores/useStores";
import { parseInitData } from "../utils/parseInitData.ts";
import { motion } from "framer-motion";

export const ProfilePage = () => {
  const { authStore } = useStores();
  const [avatarUrl, SetAvatarUrl] = useState("");
  const [email, setEmail] = useState(
    authStore.user ? authStore.user.email : "",
  );
  const [emailChanged, setEmailChanged] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) {
      console.warn("Telegram WebApp не найден");
      return;
    }
    try {
      tg.ready();
      const initData = tg.initData;
      const user = parseInitData(initData);
      if (user?.user?.photo_url) {
        SetAvatarUrl(user.user.photo_url);
      } else {
        SetAvatarUrl(
          "https://i.fbcd.co/products/resized/resized-750-500/d4c961732ba6ec52c0bbde63c9cb9e5dd6593826ee788080599f68920224e27d.jpg",
        );
      }

      setIsButtonDisabled(!emailChanged);
    } catch (e) {
      console.error("Ошибка при инициализации Telegram WebApp:", e);
    }
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
    <div className="flex h-full w-full items-start mobile:flex-col mobile:flex-nowrap mobile:gap-0">
      <div className="container max-w-none flex grow shrink-0 basis-0 flex-col items-center gap-6 self-stretch bg-default-background py-12 shadow-sm">
        <div className="flex w-full max-w-[576px] flex-col items-start gap-12">
          <div className="flex w-full flex-col items-start gap-1">
            <span className="w-full text-heading-2 font-heading-2 text-default-font">
              Профиль
            </span>
            <span className="w-full text-body font-body text-subtext-color">
              Обновите или добавьте новую информацию в ваш профиль
            </span>
          </div>
          <div className="flex w-full flex-col items-start gap-6">
            <div className="flex w-full flex-col items-start gap-4">
              <span className="text-body-bold font-body-bold text-default-font">
                Аватар
              </span>
              <div className="flex items-center gap-4">
                <img
                  className="h-16 w-16 flex-none object-cover [clip-path:circle()]"
                  src={avatarUrl}
                  alt="avatar"
                />
              </div>
            </div>

            <div className="flex w-full items-center gap-5">
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Имя пользователя
              </label>
              <motion.input
                id="email"
                type="text"
                name="username"
                value={authStore.user?.username}
                disabled={true}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                whileFocus={{ scale: 1.02 }}
              />
            </div>
            <div className="flex w-full items-center gap-4">
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Почта
              </label>
              <motion.input
                id="email"
                type="text"
                name="username"
                placeholder={authStore.user?.email}
                value={email}
                onChange={handleEmailChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                whileFocus={{ scale: 1.02 }}
              />
            </div>
            <div className="flex w-full justify-center mt-6">
              {!isButtonDisabled ? (
                <motion.button
                  type="button"
                  onClick={handleUpdateProfile}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                >
                  Сохранить изменения
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  disabled={true}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 hover:bg-blue-300 text-white transition transform hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                >
                  Сохранить изменения
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
