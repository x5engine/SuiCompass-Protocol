import { Routes, Route } from 'react-router-dom';
import App from './App';
import ChatInterface from './components/chat/ChatInterface';
import Dashboard from './components/dashboard/Dashboard';
import FAQPage from './components/pages/FAQPage';
import MarketPage from './components/pages/MarketPage';
import AssetsPage from './components/pages/AssetsPage';
import GamesPage from './components/pages/GamesPage';
import ProfilePage from './components/pages/ProfilePage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<ChatInterface />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="market" element={<MarketPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="games" element={<GamesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="faq" element={<FAQPage />} />
      </Route>
    </Routes>
  );
}