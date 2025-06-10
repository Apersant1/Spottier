import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStores } from "../stores/useStores.ts";
import { motion } from "framer-motion";
import { Plus, Map } from "lucide-react";

const TeamsPage = observer(() => {
  const { authStore, teamsStore } = useStores();
  const navigate = useNavigate();

  useEffect(() => {
    teamsStore.FetchTeams();
  }, [authStore.isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Команды</h1>

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/map")}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-2xl shadow hover:bg-blue-700 transition"
            >
              <Map size={20} /> Перейти к карте
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/teams/create")}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-2xl shadow hover:bg-orange-600 transition"
            >
              <Plus size={20} /> Создать команду
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {teamsStore.teams.map((team) => (
            <motion.div
              key={team.id}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/teams/${team.id}`)}
              className="cursor-pointer bg-gray-800 hover:bg-gray-700 rounded-2xl p-4 border border-gray-700 transition"
            >
              <h2 className="text-xl font-semibold text-white">{team.name}</h2>
              <p className="text-sm text-gray-400 mt-1">ID: {team.id}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default TeamsPage;
