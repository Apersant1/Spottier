import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "../stores/useStores";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type Match = {
  spot_id: string;
  duration: number;
  team_first_id: string;
  team_first_score: number;
  team_second_id: string;
  team_second_score: number;
  visible: boolean;
};

export const MatchListPage = observer(() => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const { teamsStore, matchesStore } = useStores();
  const navigate = useNavigate();

  async function fetchMatchesByTeamId(teamId: string): Promise<Match[]> {
    await matchesStore.fetchMatches();
    return matchesStore.matches.filter(
      (m) => m.team_first_id === teamId || m.team_second_id === teamId,
    );
  }

  const currentTeam = teamsStore.currentTeam;

  const getTeamNameById = (id: string) => {
    const team = teamsStore.teams.find((t) => t.id === id);
    return team ? team.name : id;
  };

  useEffect(() => {
    if (!currentTeam) return;

    setLoading(true);
    fetchMatchesByTeamId(currentTeam.id)
      .then(setMatches)
      .finally(() => setLoading(false));
  }, [currentTeam]);

  if (!currentTeam) {
    return (
      <div className="p-4 text-center text-red-500">
        Ошибка: текущая команда не выбрана.
      </div>
    );
  }

  const onMatchClick = (match: Match) => {
    navigate(`/matches/edit/${match.spot_id}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-gray-900 min-h-screen text-orange-500">
      <button
        onClick={() => navigate("/map")}
        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded transition"
      >
        На карту
      </button>

      <h1 className="text-4xl font-extrabold mb-8 text-center">
        Матчи команды: {currentTeam.name}
      </h1>

      {loading && (
        <p className="text-center text-orange-400">Загрузка матчей...</p>
      )}

      {!loading && matches.length === 0 && (
        <p className="text-center text-orange-400">Матчи не найдены.</p>
      )}

      <motion.ul
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } },
        }}
        className="space-y-6"
      >
        {matches.map((match) => (
          <motion.li
            key={match.spot_id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            onClick={() => onMatchClick(match)}
            className="p-6 bg-gray-800 rounded-lg shadow-lg flex justify-between items-center border-2 border-orange-500 hover:bg-orange-500 hover:text-gray-900 transition-colors cursor-pointer select-none"
          >
            <div>
              <p className="font-semibold text-xl tracking-wide">
                {getTeamNameById(match.team_first_id)}{" "}
                <span className="text-orange-400">—</span>{" "}
                {getTeamNameById(match.team_second_id)}
              </p>
              <p className="text-orange-300 text-sm mt-1">
                Длительность: {match.duration} мин
              </p>
            </div>
            <div className="text-3xl font-extrabold">
              {match.team_first_score} : {match.team_second_score}
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
});
