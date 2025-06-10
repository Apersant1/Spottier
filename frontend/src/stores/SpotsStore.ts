import { makeAutoObservable, runInAction } from "mobx";
import { AuthStore } from "./AuthStore";
export interface DrugSchedule {
  name_drug: string;
  dosage: number;
  frequency: number;
  interval: number;
  description: string;
  start_datetime: string;
  end_datetime: string;
  start_schedule: string;
  is_active: boolean;
}

export interface Spot {
  name: string;
  desc: string;
  lat: number;
  lon: number;
  country: string;
  sport_type?: string;
}

export interface SpotRead extends Spot {
  id: string;
}
const baseURL = import.meta.env.VITE_BACKEND_URL;

class SpotsStore {
  spots: SpotRead[] = [];
  loading: boolean = false;
  error: string | null = null;
  authStore: AuthStore;

  constructor(authStore: AuthStore) {
    this.authStore = authStore;
    makeAutoObservable(this);
  }
  async fetchSpots() {
    this.loading = true;
    this.error = null;
    try {
      const response = await fetch(`${baseURL}/spots`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authStore.access_token}`,
        },
      });
      const data: SpotRead[] = await response.json();

      if (data) {
        runInAction(() => {
          this.spots = data;
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

  //   addDrug = async (drug: Drug) => {
  //     this.loading = true;
  //     this.error = null;
  //     try {
  //       const response = await fetch(`${baseURL}/drugs`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${this.authStore.access_token}`,
  //         },
  //         body: JSON.stringify(drug),
  //       });
  //       const newDrug: DrugRead = await response.json();

  //       runInAction(() => {
  //         this.drugs.push(newDrug);
  //       });
  //     } catch (e) {
  //       runInAction(() => {
  //         this.error = "Ошибка при загрузке данных.";
  //       });
  //     } finally {
  //       runInAction(() => {
  //         this.loading = false;
  //       });
  //     }
  //   };

  //   updateDrug = async (id: string, updatedDrug: Drug) => {
  //     await fetch(`${baseURL}/drugs/${id}`, {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${this.authStore.access_token}`,
  //       },
  //       body: JSON.stringify(updatedDrug),
  //     });
  //   };

  //   deleteDrug = async (id: string) => {
  //     await fetch(`${baseURL}/drugs/${id}`, {
  //       method: "DELETE",
  //       headers: {
  //         Authorization: `Bearer ${this.authStore.access_token}`,
  //       },
  //     });
  //   };
}

export { SpotsStore };
