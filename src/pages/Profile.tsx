import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Wallet, 
  History,
  Settings,
  Palette, 
  TrendingUp,
  Bell,
  PlusCircle,
  Users,
  RefreshCw,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { mockUserInvestments } from '../data/mockData';
import UserPortfolioCard from '../components/UserPortfolioCard';
import { Button } from '../components/ui/button';
import { useWallet } from '../hooks/useWallet';
import { useIPOs } from '../hooks/useIPOs';
import WalletCard from '../components/WalletCard';
import PendingIPOsList from '../components/PendingIPOsList';
import AvatarUpload from '../components/AvatarUpload';
import { checkSupabaseConnection } from '../lib/supabase';

type ProfileType = 'artist' | 'investor' | 'both' | null;

interface Profile {
  id: string;
  role: ProfileType;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface IPO {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  price_per_share: number;
  total_shares: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  artwork?: {
    id: string;
    image_url: string;
  };
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview');
  const { balance, loading: walletLoading } = useWallet();
  const { ipos, loading: iposLoading } = useIPOs();
  const [editedName, setEditedName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [approvedIPOs, setApprovedIPOs] = useState<IPO[]>([]);
  const [loadingIPOs, setLoadingIPOs] = useState(true);

  const fetchApprovedIPOs = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ipos')
        .select(`
          *,
          artwork:artworks(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApprovedIPOs(data || []);
    } catch (err) {
      console.error('Erro ao buscar IPOs aprovados:', err);
    } finally {
      setLoadingIPOs(false);
    }
  }, [user]);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);

      // Check Supabase connection first
      const { isConnected, error: connectionError } = await checkSupabaseConnection();
      
      if (!isConnected) {
        setConnectionError(true);
        setError(connectionError || 'Não foi possível conectar ao servidor. Por favor, verifique sua conexão.');
        return;
      }

      // First try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, role, name, email, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!existingProfile) {
        // Profile doesn't exist, create one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || null
          }])
          .select('id, role, name, email, avatar_url')
          .single();

        if (createError) throw createError;

        setProfile(newProfile);
        setEditedName(newProfile.name || '');
      } else {
        setProfile(existingProfile);
        setEditedName(existingProfile.name || '');
      }

      // Fetch approved IPOs
      await fetchApprovedIPOs();
    } catch (error: any) {
      console.error('Erro ao buscar/criar perfil:', error);
      
      if (error.message?.includes('Failed to fetch') || error.code === 'NETWORK_ERROR') {
        setConnectionError(true);
        setError('Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.');
      } else if (error.code === 'PGRST301') {
        setError('Erro de conexão com o banco de dados. Tente novamente mais tarde.');
      } else {
        setError(error.message || 'Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [user, fetchApprovedIPOs]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchProfile();
    }
  }, [fetchProfile, mounted, retryCount]);

  const handleRetry = async () => {
    setRetrying(true);
    setRetryCount(prev => prev + 1);
  };

  const handleSaveChanges = async () => {
    if (!user || !profile) return;

    try {
      setSaving(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          name: editedName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select('id, role, name, email, avatar_url')
        .single();

      if (error) throw error;

      setProfile(data);
      alert('Alterações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      setError('Erro ao salvar alterações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileTypeSelect = async (type: ProfileType) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .update({ role: type })
        .eq('id', user.id)
        .select('id, role, name, email, avatar_url')
        .single();

      if (error) throw error;

      setProfile(data);
      
      // Redirect based on role
      if (type === 'artist') {
        navigate('/new-ipo');
      } else if (type === 'investor') {
        navigate('/market');
      } else if (type === 'both') {
        navigate('/profile');
      } else {
        // If type is null, stay on profile page
        setActiveTab('settings');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar tipo de perfil:', error);
      setError('Erro ao atualizar tipo de perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-800 p-6 rounded-lg max-w-md w-full">
          {connectionError ? (
            <>
              <div className="flex items-center mb-4">
                <WifiOff className="h-6 w-6 mr-2" />
                <h3 className="text-lg font-medium">Erro de Conexão</h3>
              </div>
              <p className="text-sm mb-4">{error}</p>
              <div className="space-y-2">
                <p className="text-sm">Tente estas soluções:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Verifique sua conexão com a internet</li>
                  <li>Atualize a página</li>
                  <li>Limpe o cache do navegador</li>
                  <li>Tente novamente em alguns minutos</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium mb-2">Erro</h3>
              <p className="text-sm mb-4">{error}</p>
            </>
          )}
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="mt-4 w-full bg-red-100 text-red-800 py-2 px-4 rounded hover:bg-red-200 transition-colors flex items-center justify-center"
          >
            {retrying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Tentando novamente...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Show profile type selection if role is not set
  if (!profile?.role) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Como você quer usar sua conta?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Escolha como você quer participar da plataforma
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-4">
              <button
                onClick={() => handleProfileTypeSelect('artist')}
                className="w-full p-6 text-left border rounded-lg hover:border-black transition-colors duration-200"
              >
                <div className="flex items-center mb-2">
                  <Palette className="h-6 w-6 text-purple-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Artista</h3>
                </div>
                <p className="text-gray-500 text-sm">
                  Publique suas obras e receba investimentos através da tokenização
                </p>
              </button>

              <button
                onClick={() => handleProfileTypeSelect('investor')}
                className="w-full p-6 text-left border rounded-lg hover:border-black transition-colors duration-200"
              >
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Investidor</h3>
                </div>
                <p className="text-gray-500 text-sm">
                  Invista em obras de arte e diversifique seu portfólio
                </p>
              </button>

              <button
                onClick={() => handleProfileTypeSelect('both')}
                className="w-full p-6 text-left border rounded-lg hover:border-black transition-colors duration-200"
              >
                <div className="flex items-center mb-2">
                  <Users className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Ambos</h3>
                </div>
                <p className="text-gray-500 text-sm">
                  Publique suas obras e também invista em outras obras
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show profile dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center">
          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name || 'Profile'}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-gray-400" />
            )}
          </div>
          <div className="ml-6 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.name || 'Usuário'}
                </h1>
                <div className="flex gap-2 mt-2">
                  {(profile?.role === 'artist' || profile?.role === 'both') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <Palette className="w-3 h-3 mr-1" />
                      Artista
                    </span>
                  )}
                  {(profile?.role === 'investor' || profile?.role === 'both') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Investidor
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation */}
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`flex-1 py-4 px-6 text-center border-b-2 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <User className="h-5 w-5 mr-2 inline" />
              Visão Geral
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center border-b-2 text-sm font-medium ${
                activeTab === 'history'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('history')}
            >
              <History className="h-5 w-5 mr-2 inline" />
              Histórico
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center border-b-2 text-sm font-medium ${
                activeTab === 'settings'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="h-5 w-5 mr-2 inline" />
              Configurações
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Artist Section */}
              {(profile.role === 'artist' || profile.role === 'both') && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Área do Artista</h2>
                    <Button onClick={() => navigate('/new-ipo')}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Nova Obra
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-500">Obras Publicadas</h3>
                        <Palette className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{approvedIPOs.length}</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-500">Total de Vendas</h3>
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-500">Preço Médio</h3>
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="mt-2 text-3xl font-bold text-gray-900">R$ 0,00</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-500">Receita Total</h3>
                        <Wallet className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="mt-2 text-3xl font-bold text-gray-900">R$ 0,00</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <WalletCard balance={balance} />
                  </div>

                  <PendingIPOsList ipos={ipos} />

                  <div className="bg-white rounded-lg border border-gray-200 mt-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Suas Obras</h3>
                    </div>
                    {loadingIPOs ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      </div>
                    ) : approvedIPOs.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {approvedIPOs.map(ipo => (
                          <div key={ipo.id} className="p-6 flex items-center">
                            <img
                              src={ipo.image_url}
                              alt={ipo.title}
                              className="h-16 w-16 object-cover rounded-lg"
                            />
                            <div className="ml-4 flex-1">
                              <h4 className="font-medium text-gray-900">{ipo.title}</h4>
                              <p className="text-sm text-gray-500">{ipo.category}</p>
                              <p className="text-sm text-gray-500">
                                {ipo.total_shares} cotas • R$ {ipo.price_per_share} por cota
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => navigate(`/artwork/${ipo.artwork?.id || ipo.id}`)}
                            >
                              Ver Detalhes
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">Você ainda não publicou nenhuma obra</p>
                        <Button onClick={() => navigate('/new-ipo')}>
                          Publicar primeira obra
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Investor Section */}
              {(profile.role === 'investor' || profile.role === 'both') && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Área do Investidor</h2>
                    <Button onClick={() => navigate('/market')}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Explorar Obras
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-500">Total Investido</h3>
                        <Wallet className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="mt-2 text-3xl font-bold text-gray-900">R$ 0,00</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-500">Valor Atual</h3>
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="mt-2 text-3xl font-bold text-gray-900">R$ 0,00</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-500">Obras no Portfólio</h3>
                        <Palette className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-500">Total de Cotas</h3>
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">IPOs em Destaque</h3>
                      <div className="space-y-4">
                        {mockUserInvestments.slice(0, 3).map(investment => (
                          <div key={investment.id} className="flex items-center space-x-4">
                            <img
                              src={investment.artworkImageUrl}
                              alt={investment.artworkTitle}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{investment.artworkTitle}</p>
                              <p className="text-xs text-gray-500">{investment.artistName}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/artwork/${investment.artworkId}`)}>
                              Ver
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas</h3>
                      <div className="space-y-4">
                        <div className="flex items-center text-yellow-600 bg-yellow-50 p-4 rounded-lg">
                          <Bell className="h-5 w-5 mr-3" />
                          <p className="text-sm">Novo IPO disponível em 2 dias</p>
                        </div>
                        <div className="flex items-center text-green-600 bg-green-50 p-4 rounded-lg">
                          <TrendingUp className="h-5 w-5 mr-3" />
                          <p className="text-sm">Uma de suas obras valorizou 15%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Resumo do Portfólio</h3>
                      <Button variant="outline" onClick={() => navigate('/portfolio')}>
                        Ver portfólio completo
                      </Button>
                    </div>
                    {mockUserInvestments.length > 0 ? (
                      <div className="space-y-4">
                        {mockUserInvestments.slice(0, 3).map(investment => (
                          <UserPortfolioCard key={investment.id} investment={investment} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Você ainda não possui investimentos</p>
                        <Button onClick={() => navigate('/market')} className="mt-4">
                          Explorar obras
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Histórico de Atividades</h2>
              <p className="text-gray-500 text-center py-8">
                Histórico de atividades em desenvolvimento
              </p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-6">Configurações da Conta</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Foto de Perfil
                  </label>
                  <AvatarUpload
                    url={profile?.avatar_url}
                    onUpload={async (url) => {
                      try {
                        const { error } = await supabase
                          .from('profiles')
                          .update({ avatar_url: url })
                          .eq('id', user.id)
                          .select()
                          .single();

                        if (error) throw error;
                        
                        // Update local state
                        setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
                      } catch (error) {
                        console.error('Error updating avatar:', error);
                        alert('Error updating avatar!');
                      }
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Conta
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {profile.role === 'artist' && 'Artista'}
                    {profile.role === 'investor' && 'Investidor'}
                    {profile.role === 'both' && 'Artista e Investidor'}
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => handleProfileTypeSelect(null)}
                  >
                    Alterar tipo de conta
                  </Button>

                  <Button
                    onClick={handleSaveChanges}
                    disabled={saving || !editedName.trim() || editedName === profile.name}
                  >
                    {saving ? 'Salvando...' : 'Salvar alterações'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;