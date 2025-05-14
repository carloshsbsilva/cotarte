import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import Home from './pages/Home';
import Market from './pages/Market';
import News from './pages/News';
import ArtworkDetail from './pages/ArtworkDetail';
import UserPortfolio from './pages/UserPortfolio';
import NewArtworkIPO from './pages/NewArtworkIPO';
import Dashboard from './pages/admin/Dashboard';
import Artworks from './pages/admin/Artworks';
import IPOModeration from './pages/admin/IPOModeration';
import Transactions from './pages/admin/Transactions';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="market" element={<Market />} />
        <Route path="news" element={<News />} />
        <Route path="artwork/:id" element={<ArtworkDetail />} />
        <Route path="portfolio" element={<AuthGuard><UserPortfolio /></AuthGuard>} />
        <Route path="new-ipo" element={<AuthGuard><NewArtworkIPO /></AuthGuard>} />
        <Route path="profile" element={<AuthGuard><Profile /></AuthGuard>} />
        <Route path="login" element={<Auth />} />
        <Route path="auth/callback" element={<AuthCallback />} />
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin" element={<AuthGuard><AdminLayout /></AuthGuard>}>
        <Route index element={<Dashboard />} />
        <Route path="obras" element={<Artworks />} />
        <Route path="ipos" element={<IPOModeration />} />
        <Route path="usuarios" element={<Dashboard />} />
        <Route path="transacoes" element={<Transactions />} />
        <Route path="estatisticas" element={<Dashboard />} />
        <Route path="configuracoes" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;