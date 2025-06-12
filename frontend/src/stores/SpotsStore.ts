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
      if (!response.ok) {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("user");
        this.authStore.access_token = "";
        this.authStore.user = null;
        this.authStore.isAuthenticated = false;
        throw new Error("Ошибка при получении данных");
      }
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

  async translatLatLogToAddress(lat: number, lon: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      );
      if (!response.ok) {
        throw new Error("Ошибка при получении адреса");
      }
      const data = await response.json();
      return {
        display_name: data.display_name,
        address: `${data?.address?.city || ""} ${data?.address?.road || ""} ${
          data?.address?.house_number || ""
        }`,
      };
    } catch (error) {
      console.error("Ошибка при получении адреса:", error);
      return "Неизвестный адрес";
    }
  }
  async addSpot(spot: Spot) {
    this.loading = true;
    this.error = null;
    try {
      const response = await fetch(`${baseURL}/spots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authStore.access_token}`,
        },
        body: JSON.stringify(spot),
      });
      const newSpot: SpotRead = await response.json();

      runInAction(() => {
        this.spots.push(newSpot);
      });
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
