import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useStores } from "../stores/useStores";
import { MatchCreatePayload } from "@/stores/MatchStore";

export const CreateMatchPage = observer(() => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { spotsStore, teamsStore, matchesStore } = useStores();
  const spotId = params.get("spot_id");

  const [duration, setDuration] = useState(60);
  const [teamFirstQuery, setTeamFirstQuery] = useState("");
  const [teamSecondQuery, setTeamSecondQuery] = useState("");
  const [teamFirstId, setTeamFirstId] = useState<string | null>(null);
  const [teamSecondId, setTeamSecondId] = useState<string | null>(null);
  const [teamFirstScore, setTeamFirstScore] = useState(0);
  const [teamSecondScore, setTeamSecondScore] = useState(0);
  const [visible, setVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamsStore.teams.length) {
      teamsStore.FetchTeams();
    }
  }, []);

  const filteredFirstTeams = teamsStore.teams.filter((team) =>
    team.name.toLowerCase().includes(teamFirstQuery.toLowerCase()),
  );

  const filteredSecondTeams = teamsStore.teams.filter((team) =>
    team.name.toLowerCase().includes(teamSecondQuery.toLowerCase()),
  );

  const handleSubmit = async () => {
    setError(null);

    // Валидация входных данных
    if (!spotId) {
      setError("Не указана площадка.");
      return;
    }

    if (!teamFirstId || !teamSecondId) {
      setError("Выберите обе команды.");
      return;
    }

    if (teamFirstId === teamSecondId) {
      setError("Команды не могут быть одинаковыми.");
      return;
    }

    if (teamFirstScore < 0 || teamSecondScore < 0) {
      setError("Счёт команд не может быть отрицательным.");
      return;
    }

    const match: MatchCreatePayload = {
      spot_id: spotId,
      duration,
      team_first_id: teamFirstId,
      team_first_score: teamFirstScore,
      team_second_id: teamSecondId,
      team_second_score: teamSecondScore,
      visible,
    };

    try {
      console.log("Создаём матч:", match);
      await matchesStore.createMatch(match);

      // После успешного создания:
      navigate("/map");
    } catch (e: any) {
      console.error("Ошибка при создании матча:", e);
      setError(e?.message || "Ошибка при создании матча.");
    }
  };

  const renderTeamSelect = (
    label: string,
    query: string,
    setQuery: (q: string) => void,
    setId: (id: string) => void,
    filteredTeams: typeof teamsStore.teams,
  ) => (
    <div>
      <label className="block mb-1 text-orange-500">{label}</label>
      <input
        type="text"
        placeholder={`Поиск: ${label}`}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setId(null);
        }}
        className="w-full p-2 rounded-lg border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
      />
      {query && (
        <ul className="bg-gray-800 border border-gray-700 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-md">
          {filteredTeams.map((team) => (
            <li
              key={team.id}
              onClick={() => {
                setQuery(team.name);
                setId(team.id);
              }}
              className="px-4 py-2 hover:bg-orange-500 hover:text-white cursor-pointer transition"
            >
              {team.name}
            </li>
          ))}
          {filteredTeams.length === 0 && (
            <li className="px-4 py-2 text-sm text-gray-400">
              Команда не найдена
            </li>
          )}
        </ul>
      )}
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6 bg-gray-900 text-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-orange-500">Создание матча</h1>

      {error && (
        <div className="p-3 bg-red-600 text-white rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {teamsStore.isLoading ? (
        <div className="text-center text-gray-400 py-10">
          Загрузка команд...
        </div>
      ) : (
        <>
          {renderTeamSelect(
            "Команда 1",
            teamFirstQuery,
            setTeamFirstQuery,
            setTeamFirstId,
            filteredFirstTeams,
          )}
          {renderTeamSelect(
            "Команда 2",
            teamSecondQuery,
            setTeamSecondQuery,
            setTeamSecondId,
            filteredSecondTeams,
          )}

          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block mb-1 text-orange-500">
                Счёт команды 1
              </label>
              <input
                type="number"
                min="0"
                value={teamFirstScore}
                onChange={(e) => setTeamFirstScore(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-gray-700 bg-gray-800 text-white"
              />
            </div>

            <div className="w-1/2">
              <label className="block mb-1 text-orange-500">
                Счёт команды 2
              </label>
              <input
                type="number"
                min="0"
                value={teamSecondScore}
                onChange={(e) => setTeamSecondScore(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-gray-700 bg-gray-800 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-orange-500">
              Длительность (минут)
            </label>
            <input
              type="number"
              min="10"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full p-2 rounded-lg border border-gray-700 bg-gray-800 text-white"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={visible}
              onChange={() => setVisible(!visible)}
              className="form-checkbox h-5 w-5 text-orange-500 bg-gray-800 border-gray-700"
            />
            <label className="text-white">Публичный матч</label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Создать матч
            </button>
            <button
              onClick={() => navigate("/map")}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Отменить
            </button>
          </div>
        </>
      )}
    </div>
  );
});
