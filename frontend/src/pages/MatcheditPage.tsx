import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStores } from "../stores/useStores";
import { useParams, useNavigate } from "react-router-dom";

type Match = {
  id: string;
  spot_id: string;
  duration: number;
  team_first_id: string;
  team_first_score: number;
  team_second_id: string;
  team_second_score: number;
  visible: boolean;
};

const ScoreControl = ({
  teamName,
  score,
  setScore,
}: {
  teamName: string;
  score: number;
  setScore: (val: number) => void;
}) => (
  <div className="flex flex-col items-center space-y-2">
    <button
      onClick={() => setScore(score + 1)}
      className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white text-xl font-bold shadow"
    >
      +
    </button>

    <div>
      <label className="block mb-1 text-center font-semibold">
        Счет {teamName}
      </label>
      <input
        type="number"
        min={0}
        value={score}
        onChange={(e) => setScore(parseInt(e.target.value) || 0)}
        className="w-20 p-2 rounded border border-orange-500 text-center text-white font-bold"
      />
    </div>

    <button
      onClick={() => setScore(Math.max(0, score - 1))}
      className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white text-xl font-bold shadow"
    >
      −
    </button>
  </div>
);

export const MatchEditPage = observer(() => {
  const { matchesStore, teamsStore } = useStores();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(null);
  const [scoreFirst, setScoreFirst] = useState<number>(0);
  const [scoreSecond, setScoreSecond] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTeamNameById = (id: string) => {
    const team = teamsStore.teams.find((t) => t.id === id);
    return team ? team.name : id;
  };

  useEffect(() => {
    async function loadMatch() {
      await matchesStore.fetchMatches();
      const found = matchesStore.matches.find((m) => m.spot_id === id);
      if (found) {
        setMatch(found);
        setScoreFirst(found.team_first_score);
        setScoreSecond(found.team_second_score);
      }
    }
    loadMatch();
  }, [id, matchesStore]);

  if (!match) {
    return (
      <div className="p-4 text-center text-orange-500">Загрузка матча...</div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        spot_id: match.spot_id,
        duration: match.duration,
        visible: match.visible,
        team_first_id: match.team_first_id,
        team_first_score: scoreFirst,
        team_second_id: match.team_second_id,
        team_second_score: scoreSecond,
      };

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/matches/${match.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${matchesStore.authStore.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Ошибка обновления счета");
      }

      await matchesStore.fetchMatches();
      navigate(-1);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 min-h-screen text-orange-500 rounded-md shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Редактирование счета матча
      </h1>

      <div className="mb-4 text-lg text-center">
        <p>
          <span className="font-semibold">
            {getTeamNameById(match.team_first_id)}
          </span>{" "}
          —{" "}
          <span className="font-semibold">
            {getTeamNameById(match.team_second_id)}
          </span>
        </p>
        <p>Длительность: {match.duration} мин</p>
      </div>

      <div className="flex space-x-12 justify-center mb-8">
        <ScoreControl
          teamName={getTeamNameById(match.team_first_id)}
          score={scoreFirst}
          setScore={setScoreFirst}
        />
        <ScoreControl
          teamName={getTeamNameById(match.team_second_id)}
          score={scoreSecond}
          setScore={setScoreSecond}
        />
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
          disabled={saving}
        >
          Отмена
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded bg-orange-500 hover:bg-orange-600 transition font-bold text-white"
          disabled={saving}
        >
          {saving ? "Сохраняем..." : "Сохранить"}
        </button>
      </div>
    </div>
  );
});
