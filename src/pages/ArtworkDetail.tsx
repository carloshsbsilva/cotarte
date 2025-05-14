import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertCircle,
  WifiOff,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  ShoppingBag
} from 'lucide-react';
import { supabase, checkSupabaseConnection } from '../lib/supabase';
import ArtworkGallery from '../components/ArtworkGallery';
import PriceChart from '../components/PriceChart';
import TransactionHistory from '../components/TransactionHistory';
import CommentSection from '../components/CommentSection';
import { Button } from '../components/ui/button';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const ArtworkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [artwork, setArtwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [userShares, setUserShares] = useState(0);
  const [priceHistory, setPriceHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'1D' | '1W' | '1M' | '1Y' | 'All'>('1M');
  const [retryCount, setRetryCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const retryFetch = async (fn: () => Promise<any>, maxRetries = 3) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await fn();
        return result;
      } catch (error: any) {
        lastError = error;
        if (i === maxRetries - 1) break;
        const backoffMs = Math.min(1000 * Math.pow(2, i), 5000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
    throw lastError;
  };

  const checkConnection = async () => {
    const { isConnected, error } = await checkSupabaseConnection();
    if (!isConnected) {
      setConnectionError(true);
      throw new Error(error || 'Falha ao conectar ao servidor. Por favor, verifique sua conexão com a internet.');
    }
  };

  const fetchArtworkDetails = useCallback(async () => {
    try {
      await checkConnection();
      setConnectionError(false);

      // First try to fetch from artworks table
      const { data: artworkData, error: artworkError } = await supabase
        .from('artworks')
        .select(`
          *,
          ipo:ipos (
            title,
            description,
            image_url,
            category,
            user:profiles (
              id,
              name,
              first_name,
              last_name
            )
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (artworkError) throw artworkError;

      if (!artworkData) {
        // If not found in artworks, try to fetch from IPOs
        const { data: ipoData, error: ipoError } = await supabase
          .from('ipos')
          .select(`
            *,
            user:profiles (
              id,
              name,
              first_name,
              last_name
            ),
            artwork:artworks (*)
          `)
          .eq('id', id)
          .eq('status', 'approved')
          .maybeSingle();

        if (ipoError) throw ipoError;
        if (!ipoData) {
          setArtwork(null);
          return;
        }

        // Transform IPO data to artwork format
        const transformedArtwork = {
          id: ipoData.artwork?.id || ipoData.id,
          title: ipoData.title,
          artist: ipoData.user?.first_name && ipoData.user?.last_name 
            ? `${ipoData.user.first_name} ${ipoData.user.last_name}`
            : ipoData.user?.name || 'Artista',
          description: ipoData.description,
          imageUrl: ipoData.image_url,
          price_per_share: ipoData.price_per_share,
          total_shares: ipoData.total_shares,
          category: ipoData.category,
          created_at: ipoData.created_at
        };

        setArtwork(transformedArtwork);
      } else {
        // Transform artwork data
        const transformedArtwork = {
          ...artworkData,
          title: artworkData.ipo?.title || artworkData.title,
          artist: artworkData.ipo?.user?.first_name && artworkData.ipo?.user?.last_name
            ? `${artworkData.ipo.user.first_name} ${artworkData.ipo.user.last_name}`
            : artworkData.ipo?.user?.name || 'Artista',
          description: artworkData.ipo?.description || artworkData.description,
          imageUrl: artworkData.ipo?.image_url || artworkData.image_url,
          category: artworkData.ipo?.category || artworkData.category
        };

        setArtwork(transformedArtwork);
      }

      // Fetch user shares if authenticated
      if (user) {
        const { data: sharesData } = await supabase
          .from('user_shares')
          .select('shares')
          .eq('artwork_id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        setUserShares(sharesData?.shares || 0);
      }

      // Fetch price history
      const { data: priceHistoryData } = await supabase
        .from('transactions')
        .select('price_per_share, created_at')
        .eq('artwork_id', id)
        .order('created_at', { ascending: true });

      setPriceHistory(priceHistoryData || []);

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select(`
          *,
          buyer:profiles!transactions_user_id_fkey(name),
          seller:profiles(name)
        `)
        .eq('artwork_id', id)
        .order('created_at', { ascending: false });

      setTransactions(transactionsData || []);

      // Fetch comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(name, avatar_url)
        `)
        .eq('artwork_id', id)
        .order('created_at', { ascending: false });

      setComments(commentsData || []);

      setError(null);
    } catch (err: any) {
      console.error('Erro ao buscar obra:', err);
      setError(err.message);
    }
  }, [id, user]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (mounted) {
      setLoading(true);
      retryFetch(fetchArtworkDetails)
        .catch(err => {
          console.error('Falha ao buscar obra após tentativas:', err);
          setError(err.message || 'Falha ao carregar obra. Por favor, tente novamente mais tarde.');
        })
        .finally(() => setLoading(false));
    }
  }, [fetchArtworkDetails, mounted, retryCount]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setConnectionError(false);
    setRetryCount(count => count + 1);
  };

  if (loading && !artwork) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md w-full p-6">
          <WifiOff className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro de Conexão</h2>
          <p className="text-gray-600 mb-4">Não foi possível conectar ao servidor. Isso pode ser devido a:</p>
          <ul className="text-gray-600 mb-4 list-disc list-inside text-left">
            <li>Sua conexão com a internet</li>
            <li>O servidor estar temporariamente indisponível</li>
            <li>Alta latência na rede</li>
          </ul>
          <Button 
            onClick={handleRetry}
            className="inline-flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md w-full p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={handleRetry}
            className="inline-flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Obra Não Encontrada</h2>
          <p className="text-gray-600 mb-4">A obra que você está procurando não existe ou foi removida.</p>
          <Button onClick={() => navigate('/market')}>
            Voltar ao Mercado
          </Button>
        </div>
      </div>
    );
  }

  const isPositiveChange = artwork?.percentageChange >= 0;
  const marketCap = artwork?.price_per_share * artwork?.total_shares;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left column - Artwork visuals */}
        <div>
          <ArtworkGallery
            images={[artwork?.imageUrl]}
            title={artwork?.title}
          />
          
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {artwork?.category}
            </span>
          </div>

          <Button 
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => {
              if (!user) {
                navigate('/login', { state: { from: `/artwork/${id}` } });
                return;
              }
              // TODO: Handle physical purchase
            }}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Comprar Obra Física
          </Button>
        </div>
        
        {/* Right column - Artwork info */}
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{artwork?.title}</h1>
            <p className="text-xl text-gray-600 mb-4">
              por {artwork?.artist}
            </p>
            
            <div className="flex items-center space-x-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Preço por cota</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(artwork?.price_per_share)}
                </p>
              </div>
              {artwork?.percentageChange && (
                <div className={`flex items-center ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositiveChange ? (
                    <ArrowUpRight className="h-6 w-6 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-6 w-6 mr-1" />
                  )}
                  <span className="text-lg font-semibold">
                    {isPositiveChange ? '+' : ''}{artwork?.percentageChange}%
                  </span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center text-gray-500 mb-1">
                  <Users className="w-4 h-4 mr-1" />
                  <p className="text-sm">Total de Cotas</p>
                </div>
                <p className="text-lg font-semibold">{artwork?.total_shares}</p>
              </div>
              
              {user && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-500 mb-1">
                    <Wallet className="w-4 w-4 mr-1" />
                    <p className="text-sm">Suas Cotas</p>
                  </div>
                  <p className="text-lg font-semibold">{userShares}</p>
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Valor de Mercado</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(marketCap)}
                </p>
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Sobre a Obra</h2>
              <p className="text-gray-600">{artwork?.description}</p>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                className="flex-1"
                onClick={() => {
                  if (!user) {
                    navigate('/login', { state: { from: `/artwork/${id}` } });
                    return;
                  }
                  // TODO: Open buy dialog
                }}
              >
                Comprar Cotas
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  if (!user) {
                    navigate('/login', { state: { from: `/artwork/${id}` } });
                    return;
                  }
                  // TODO: Open sell dialog
                }}
              >
                Vender Cotas
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Price History */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Histórico de Preços</h2>
          <div className="flex space-x-2">
            {(['1D', '1W', '1M', '1Y', 'All'] as const).map((period) => (
              <button
                key={period}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  selectedPeriod === period
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        
        <PriceChart 
          priceHistory={priceHistory}
          period={selectedPeriod}
        />
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Histórico de Transações</h2>
        <TransactionHistory transactions={transactions} />
      </div>

      {/* Comments */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <CommentSection comments={comments} artworkId={id || ''} />
      </div>
    </div>
  );
};

export default ArtworkDetail;