import { makeAutoObservable, runInAction } from "mobx";
import { AuthStore } from "./AuthStore";

export interface Team {
  name: string;
  desc: string;
  member_count: number;
  members: string[];
  created_at: Date | string;
}

export interface TeamRead extends Team {
  id: string;
}
const baseURL = import.meta.env.VITE_BACKEND_URL;

class TeamStore {
  teams: TeamRead[] = [];
  currentTeam: TeamRead | null = null;
  loading: boolean = false;
  error: string | null = null;
  authStore: AuthStore;

  constructor(authStore: AuthStore) {
    this.authStore = authStore;
    makeAutoObservable(this);
  }
  async FetchTeams() {
    this.loading = true;
    this.error = null;
    try {
      const response = await fetch(`${baseURL}/teams`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authStore.access_token}`,
        },
      });
      const data: TeamRead[] = await response.json();

      if (data) {
        runInAction(() => {
          this.teams = data;
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

  async FetchTeamById(teamId: string) {
    this.loading = true;
    this.error = null;
    try {
      const response = await fetch(`${baseURL}/teams/${teamId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authStore.access_token}`,
        },
      });
      const data: TeamRead = await response.json();
      runInAction(() => {
        this.currentTeam = data;
      });
    } catch (e) {
      runInAction(() => {
        this.error = "Не удалось загрузить команду.";
        this.currentTeam = null;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async joinTeam(
    teamId: string,
    userId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `${baseURL}/teams/${teamId}/add-users/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.authStore.access_token}`,
          },
        },
      );
      if (!response.ok) {
        const data = await response.json();
        return {
          success: false,
          error: data.detail || "Ошибка при вступлении.",
        };
      }

      // Обновим текущую команду после вступления
      await this.FetchTeamById(teamId);
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
  async LeaveTeam(teamId: string, userId: string) {
    this.loading = true;
    this.error = null;
    try {
      const response = await fetch(
        `${baseURL}/teams/${teamId}/delete-users/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.authStore.access_token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Ошибка при выходе из команды");

      runInAction(() => {
        // Можно сразу удалить текущую команду или обновить список
        this.currentTeam = null;
      });
    } catch (e) {
      runInAction(() => {
        this.error = "Не удалось покинуть команду.";
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
  async CreateTeam(
    team: Omit<Team, "member_count" | "members" | "created_at">,
  ) {
    this.loading = true;
    this.error = null;
    try {
      const response = await fetch(`${baseURL}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authStore.access_token}`,
        },
        body: JSON.stringify(team),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Ошибка при создании команды");
      }

      const newTeam: TeamRead = await response.json();
      runInAction(() => {
        this.teams.push(newTeam);
      });
      return { success: true, team: newTeam };
    } catch (e) {
      runInAction(() => {
        this.error = (e as Error).message;
      });
      return { success: false, error: this.error };
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export { TeamStore };
