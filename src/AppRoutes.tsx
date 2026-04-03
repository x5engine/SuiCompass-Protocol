import { Routes, Route } from 'react-router-dom';
import { lazy } from 'react';
import App from './App';
import LazyLoad from './components/common/LazyLoad';

// Lazy load all page components for better code splitting
const ChatInterface = lazy(() => import('./components/chat/ChatInterface'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const MarketPage = lazy(() => import('./components/pages/MarketPage'));
const SocialTradingPage = lazy(() => import('./components/pages/SocialTradingPage'));
const StreamPaymentsPage = lazy(() => import('./components/pages/StreamPaymentsPage'));
const BridgePage = lazy(() => import('./components/pages/BridgePage'));
const AssetsPage = lazy(() => import('./components/pages/AssetsPage'));
const GamesPage = lazy(() => import('./components/pages/GamesPage'));
const ProfilePage = lazy(() => import('./components/pages/ProfilePage'));
const FAQPage = lazy(() => import('./components/pages/FAQPage'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<LazyLoad component={ChatInterface} />} />
        <Route path="dashboard" element={<LazyLoad component={Dashboard} />} />
        <Route path="market" element={<LazyLoad component={MarketPage} />} />
        <Route path="social-trading" element={<LazyLoad component={SocialTradingPage} />} />
        <Route path="stream-payments" element={<LazyLoad component={StreamPaymentsPage} />} />
        <Route path="bridge" element={<LazyLoad component={BridgePage} />} />
        <Route path="assets" element={<LazyLoad component={AssetsPage} />} />
        <Route path="games" element={<LazyLoad component={GamesPage} />} />
        <Route path="profile" element={<LazyLoad component={ProfilePage} />} />
        <Route path="faq" element={<LazyLoad component={FAQPage} />} />
      </Route>
    </Routes>
  );
}