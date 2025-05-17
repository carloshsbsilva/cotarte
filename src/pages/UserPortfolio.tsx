import React, { useState, useEffect } from 'react';
import { PieChart, Wallet, BarChart3, RefreshCw, WifiOff } from 'lucide-react';
import UserPortfolioCard from '../components/UserPortfolioCard';
import { supabase, checkSupabaseConnection } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePortfolio } from '../hooks/usePortfolio';
import { UserInvestment } from '../types';
import { Button } from '../components/ui/button';
import { formatCurrency } from '../lib/utils';

const UserPortfolio: React.FC = () => {
  const { user } = useAuth();
  const { portfolio, loading: portfolioLoading } = usePortfolio();
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState(false);

  const fetchInvestments = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setConnectionError(false);

    try {
      // First check if we can connect to Supabase
      const { isConnected, error: connectionError } = await checkSupabaseConnection();
      
      if (!isConnected) {
        setConnectionError(true);
        throw new Error(connectionError || 'Não foi possível conectar ao servidor');
      }

      const { data, error } = await supabase
        .from('user_shares')
        .select(`
          id,
          shares,
          artwork:artworks (
            id,
            title,
            image_url,
            price_per_share,
            market_value,
            total_shares
          )
        `)
        .eq('user_id', user.id)
        .gt('shares', 0); // Only get shares where user has more than 0

      if (error) throw error;

      // If no shares found, set empty investments array
      if (!data || data.length === 0) {
        setInvestments([]);
        setLoading(false);
        return;
      }

      // Transform data into UserInvestment format
      const transformedInvestments: UserInvestment[] = data.map(item => ({
        id: item.id,
        userId: user.id,
        artworkId: item.artwork.id,
        artworkTitle: item.artwork.title,
        artworkImageUrl: item.artwork.image_url,
        artistName: 'Unknown Artist', // Since we're not fetching artist info anymore
        shares: item.shares,
        initialPricePerShare: item.artwork.price_per_share,
        currentPricePerShare: item.artwork.market_value / item.artwork.total_shares,
        percentageChange: ((item.artwork.market_value / item.artwork.total_shares - item.artwork.price_per_share) / item.artwork.price_per_share) * 100,
        purchaseDate: new Date().toISOString() // This should come from transaction history in a real implementation
      }));

      setInvestments(transformedInvestments);
    } catch (error: any) {
      console.error('Error fetching investments:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [user]);

  if (loading || portfolioLoading) {
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
            onClick={fetchInvestments}
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
          <p className="text-red-800 mb-4">{error}</p>
          <Button
            onClick={fetchInvestments}
            className="inline-flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Portfólio</h1>
      <p className="text-gray-600 mb-8">Gerencie seus investimentos em arte</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <Wallet className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Valor Total</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(portfolio?.total_value || 0)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Total Investido</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(portfolio?.total_invested || 0)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <PieChart className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Obras no Portfólio</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{investments.length}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Seus Investimentos</h2>
        
        <div className="space-y-4">
          {investments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-lg mb-4">Você ainda não possui investimentos</p>
              <Button onClick={() => window.location.href = '/market'}>
                Explorar mercado
              </Button>
            </div>
          ) : (
            investments.map(investment => (
              <UserPortfolioCard key={investment.id} investment={investment} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPortfolio;