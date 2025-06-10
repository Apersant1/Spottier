import { AuthStore } from "./AuthStore";
import { MatchesStore } from "./MatchStore";
import { SpotsStore } from "./SpotsStore";
import { TeamStore } from "./TeamsStore";

const authStore = new AuthStore();
const spotsStore = new SpotsStore(authStore);
const teamsStore = new TeamStore(authStore);
const matchesStore = new MatchesStore(authStore);

export const stores = {
  authStore,
  spotsStore,
  teamsStore,
  matchesStore,
};

export type StoresType = typeof stores;
