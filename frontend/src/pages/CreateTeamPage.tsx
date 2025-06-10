import React, { useState } from "react";
import { motion } from "framer-motion";
import { useStores } from "../stores/useStores";
import { useNavigate } from "react-router-dom";

const CreateTeamPage = () => {
  const navigate = useNavigate();
  const { teamsStore } = useStores();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Название команды обязательно");
      return;
    }

    const result = await teamsStore.CreateTeam({ name, desc });

    if (result.success) {
      setSuccess("Команда успешно создана!");
      setName("");
      setDesc("");
    } else {
      setError(result.error || "Ошибка при создании команды");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate("/teams")}
          className="mb-6 text-sm text-white hover:underline"
        >
          ← Назад к списку команд
        </button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6 bg-white rounded-2xl shadow-lg"
        >
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">
            Создание команды
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название команды
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите название"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите описание"
                rows={4}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                {JSON.stringify(error)}
              </div>
            )}
            {success && <div className="text-green-500 text-sm">{success}</div>}

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              type="submit"
              disabled={teamsStore.loading}
              className={`w-full font-semibold py-2 px-4 rounded-xl transition 
                ${
                  teamsStore.loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-600 hover:bg-orange-700 text-white"
                }`}
            >
              {teamsStore.loading ? "Создание..." : "Создать команду"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateTeamPage;
