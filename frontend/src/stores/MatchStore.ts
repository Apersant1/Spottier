// stores/MatchesStore.ts
import { makeAutoObservable, runInAction } from "mobx";
import { AuthStore } from "./AuthStore";

export interface Team {
  id: string;
  name: string;
}

export interface MatchCreatePayload {
  spot_id: string;
  duration: number;
  team_first_id: string;
  team_first_score: number;
  team_second_id: string;
  team_second_score: number;
  visible: boolean;
}
const baseURL = import.meta.env.VITE_BACKEND_URL;

export class MatchesStore {
  authStore: AuthStore;
  matches: MatchCreatePayload[] = [];
  loadingTeams = false;
  teams: Team[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(authStore: AuthStore) {
    this.authStore = authStore;
    makeAutoObservable(this);
  }

  async createMatch(payload: MatchCreatePayload) {
    const res = await fetch(`${baseURL}/matches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.authStore.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Ошибка создания матча: ${errorText}`);
    }
    return await res.json();
  }
  async fetchMatches(): MatchCreatePayload[] {
    this.loading = true;
    this.error = null;
    try {
      const response = await fetch(`${baseURL}/matches`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authStore.access_token}`,
        },
      });
      const data: MatchCreatePayload[] = await response.json();

      if (data) {
        runInAction(() => {
          this.matches = data;
        });
      }
    } catch (e) {
      runInAction(() => {
        this.error = "Ошибка при загрузке данных.";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
  async updateMatch(
    id: string,
    payload: Partial<MatchCreatePayload>,
  ): Promise<MatchCreatePayload> {
    const res = await fetch(`${baseURL}/matches/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${this.authStore.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Ошибка обновления матча: ${errorText}`);
    }
    return await res.json();
  }
}
