import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { IUserCreate } from "../stores/AuthStore";
import { useStores } from "../stores/useStores";
import { motion } from "framer-motion";

const RegisterPage = () => {
  const { authStore } = useStores();
  const navigate = useNavigate();
  const [user, setUser] = useState<IUserCreate>({
    username: "",
    email: "",
    password: "",
    gender: true,
    age: 0,
    tg_id: Number(sessionStorage.getItem("telegram_id")) || 0,
    time_zone: 0,
    is_active: true,
    is_superuser: false,
    is_verified: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: (() => {
        if (name === "gender") return value === "true";
        if (name === "age" || name === "tg_id" || name === "time_zone")
          return parseInt(value);
        return value;
      })(),
    }));
  };

  useEffect(() => {
    const offsetInHours = -new Date().getTimezoneOffset() / 60;
    setUser((prev) => ({
      ...prev,
      time_zone: offsetInHours,
    }));
  }, []);

  const handleRegister = async () => {
    try {
      await authStore.register(user);
      // После успешной регистрации можно перенаправить пользователя или выполнить другие действия
      navigate("/login");
    } catch (error) {
      // Обработка ошибок с сервера
      const errorData: Record<string, string>[] = JSON.parse(error as string);
      if (errorData) {
        const formattedErrors: { [key: string]: string } = {};
        errorData.forEach((error) => {
          for (const [field, message] of Object.entries(error)) {
            formattedErrors[field] = message;
          }
        });
        setFormErrors(formattedErrors); // Обновляем состояние с ошибками
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h1 className="text-3xl font-semibold text-center text-gray-700 mb-6">
          Зарегистрироваться
        </h1>

        {/* Поля формы */}
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Имя пользователя
          </label>
          <motion.input
            id="username"
            type="text"
            name="username"
            value={user.username}
            onChange={handleChange}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            whileFocus={{ scale: 1.02 }}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Почта
          </label>
          <motion.input
            id="email"
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            whileFocus={{ scale: 1.02 }}
          />
          {formErrors.email && (
            <p className="text-red-500 text-sm">{formErrors.email}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Пароль
          </label>
          <motion.input
            id="password"
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            whileFocus={{ scale: 1.02 }}
          />
          {formErrors.password && (
            <p className="text-red-500 text-sm">{formErrors.password}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="gender"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Пол
          </label>
          <motion.select
            id="gender"
            name="gender"
            value={user.gender.toString()}
            onChange={handleChange}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            whileFocus={{ scale: 1.02 }}
          >
            <option value="true">Мужчина</option>
            <option value="false">Женщина</option>
          </motion.select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="age"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Возраст
          </label>
          <motion.input
            id="age"
            type="number"
            name="age"
            value={user.age}
            onChange={handleChange}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            whileFocus={{ scale: 1.02 }}
          />
          {formErrors.age && (
            <p className="text-red-500 text-sm">{formErrors.age}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="time_zone"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Time Zone
          </label>
          <motion.select
            id="time_zone"
            name="time_zone"
            value={user.time_zone}
            onChange={handleChange}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            whileFocus={{ scale: 1.02 }}
          >
            {Array.from({ length: 27 }, (_, i) => {
              const offset = i - 12;
              const label =
                offset >= 0
                  ? `UTC+${offset === 0 ? "" : offset}`
                  : `UTC${offset}`;
              return (
                <option key={offset} value={offset}>
                  {label}
                </option>
              );
            })}
          </motion.select>
        </div>

        <motion.button
          type="button"
          onClick={handleRegister}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          whileHover={{ scale: 1.05 }}
        >
          Зарегистрироваться
        </motion.button>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
