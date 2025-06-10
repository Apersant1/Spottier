import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useStores } from "./stores/useStores";
import AuthPage from "./pages/AuthPage";
import { ProfilePage } from "./pages/ProfilePage";
import { MapPage } from "./pages/MapPage";
import { ProtectedRoute } from "./components/PretectedRoute";
import Layout from "./components/layout/layout";

// Pages
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import MainPage from "./pages/MainPage";
import HomePage from "./pages/HomePage";
import { MatchListPage } from "./pages/MatchesPage";

import "leaflet/dist/leaflet.css";
import "./App.css";
import TeamsPage from "./pages/TeamsPage";
import TeamDetailPage from "./pages/TeamDetailPage";
import { CreateMatchPage } from "./pages/CreateMatchPage";
import { MatchEditPage } from "./pages/MatcheditPage";
import CreateTeamPage from "./pages/CreateTeamPage";

const App = observer(() => {
  const { authStore } = useStores();

  // useEffect(() => {
  //   if (authStore.isAuthenticated) {
  //     calendarStore.fetchEvents();
  //   }
  // }, [authStore.isAuthenticated, calendarStore]);

  useEffect(() => {
    // if (authStore.isAuthenticated) {
    //   calendarStore.fetchEvents();
    // }
  }, [authStore.isAuthenticated]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route path="/matches" element={<MatchListPage />} />
          <Route path="/matches/edit/:id" element={<MatchEditPage />} />
          <Route
            path="/main"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />
          <Route path="/create-match" element={<CreateMatchPage />} />
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <TeamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/create"
            element={
              <ProtectedRoute>
                <CreateTeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/:teamId"
            element={
              <ProtectedRoute>
                <TeamDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </Layout>
    </Router>
  );
});

export default App;
