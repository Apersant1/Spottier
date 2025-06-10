import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStores } from "../stores/useStores.ts";
import { parseInitData } from "../utils/parseInitData.ts";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { authStore } = useStores();
  const navigate = useNavigate();

  useEffect(() => {
    if (authStore.isAuthenticated) navigate("/map");
  }, [authStore.isAuthenticated]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await authStore.login(username, password);
      navigate("/map");
    } catch (e) {
      setError("Ошибка авторизации");
      console.log(JSON.stringify(e));
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const redirectRegister = () => {
    navigate("/register");
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100 relative">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-md z-50"
        >
          {error}
          <button
            className="ml-4 text-sm text-red-500 hover:underline"
            onClick={() => setError("")}
          >
            Закрыть
          </button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-8 rounded-lg shadow-lg w-96 transform transition-all duration-300 ease-in-out hover:scale-105"
      >
        <h1 className="text-3xl font-semibold text-center text-gray-700 mb-6">
          Войти
        </h1>

        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-600 mb-2">
            Почта
          </label>
          <motion.input
            id="username"
            type="text"
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите email адрес"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            whileFocus={{ scale: 1.02 }}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-600 mb-2">
            Пароль
          </label>
          <motion.input
            id="password"
            type="password"
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            whileFocus={{ scale: 1.02 }}
          />
        </div>

        <motion.button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 rounded-lg transition duration-200 ease-in-out ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          whileHover={!loading ? { scale: 1.05 } : {}}
        >
          {loading ? "Загрузка..." : "Войти"}
        </motion.button>

        <motion.button
          onClick={redirectRegister}
          className="w-full text-blue-500 py-3 mt-4 rounded-lg hover:bg-blue-100 transition duration-200 ease-in-out"
          whileHover={{ scale: 1.05 }}
        >
          Зарегистрироваться
        </motion.button>
      </motion.div>
    </div>
  );
}
