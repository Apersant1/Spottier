import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStores } from "../stores/useStores";
import { observer } from "mobx-react-lite";

const TeamDetailsPage = observer(() => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { teamsStore, authStore } = useStores();

  const userId = authStore.user?.id;

  useEffect(() => {
    if (teamId) {
      teamsStore.FetchTeamById(teamId);
    }
  }, [teamId]);

  const { currentTeam, loading, error } = teamsStore;

  const handleJoinTeam = async () => {
    if (teamId && userId) {
      await teamsStore.joinTeam(teamId, userId);
      await teamsStore.FetchTeamById(teamId); // обновить данные после вступления
    }
  };

  const handleLeaveTeam = async () => {
    if (teamId && userId) {
      await teamsStore.LeaveTeam(teamId, userId);
      navigate("/teams");
    }
  };

  if (loading) return <div className="text-white p-4">Загрузка...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!currentTeam)
    return <div className="text-gray-400 p-4">Команда не найдена</div>;

  const isMember = currentTeam.members.includes(userId || "");

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-2xl p-6 shadow">
        <h1 className="text-3xl font-bold text-orange-500 mb-2">
          {currentTeam.name}
        </h1>
        <p className="text-gray-300">Описание: {currentTeam.desc}</p>
        <p className="text-gray-400 mt-2">
          Участников: {currentTeam.member_count}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Создана: {new Date(currentTeam.created_at).toLocaleString()}
        </p>

        <div className="mt-4">
          <h2 className="text-lg font-semibold text-orange-400 mb-2">
            Участники:
          </h2>
          <ul className="list-disc list-inside text-gray-300">
            {currentTeam.members.map((member, index) => (
              <li key={index}>{member}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex gap-4 flex-wrap">
          {!isMember && (
            <button
              onClick={handleJoinTeam}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-2xl transition"
            >
              Вступить в команду
            </button>
          )}

          {isMember && (
            <button
              onClick={handleLeaveTeam}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-2xl transition"
            >
              Покинуть команду
            </button>
          )}

          <button
            onClick={() => navigate("/teams")}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-2xl transition"
          >
            Назад к списку
          </button>
        </div>
      </div>
    </div>
  );
});

export default TeamDetailsPage;
