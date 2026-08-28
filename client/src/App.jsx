import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

import LoadingScreen from "./components/LoadingScreen.jsx";
import TopBar from "./components/TopBar.jsx";
import BottomNav from "./components/BottomNav.jsx";
import { ToastHost } from "./components/Toast.jsx";

import AuthPage from "./pages/AuthPage.jsx";
import MainHome from "./pages/MainHome.jsx";
import LiveLobby from "./pages/LiveLobby.jsx";
import GameRoom from "./pages/GameRoom.jsx";
import MiniGames from "./pages/MiniGames.jsx";
import StakingList from "./pages/StakingList.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SupportPage from "./pages/SupportPage.jsx";
import DealerAdmin from "./pages/DealerAdmin.jsx";
import HostDashboard from "./pages/HostDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function AppShell() {
  const { status } = useAuth();
  const location = useLocation();
  const isGameRoom = location.pathname.startsWith("/game/");

  if (status === "booting") return <LoadingScreen />;
  if (status === "error") return <AuthPage />;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-base">
      <TopBar />
      <main className={`flex flex-1 flex-col ${isGameRoom ? "" : "pb-24"}`}>
        <Routes>
          <Route path="/" element={<MainHome />} />
          <Route path="/live" element={<LiveLobby />} />
          <Route path="/game/:roomId" element={<GameRoom />} />
          <Route path="/minigames" element={<MiniGames />} />
          <Route path="/staking" element={<StakingList />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dealer" element={<DealerAdmin />} />
          <Route path="/host" element={<HostDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/live" replace />} />
        </Routes>
      </main>
      <BottomNav />
      <ToastHost />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
