import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import ArtworkCard from '../components/ArtworkCard';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Artwork } from '../types';

const CATEGORIES = [
  'Pintura',
  'Escultura',
  'Fotografia',
  'Digital',
  'Instalação',
  'Impressão',
  'Desenho',
  'Colagem',
  'NFT',
  'Outro'
] as const;

type SortOption = 'recent' | 'price-high' | 'price-low' | 'investors' | 'change-high' | 'change-low';

const Market: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number | null }>({
    min: 0,
    max: null
  });

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        setError(null);

        // First fetch approved IPOs
        const { data: approvedIpos, error: iposError } = await supabase
          .from('ipos')
          .select(`
            *,
            artwork:artworks(*),
            user:profiles!ipos_user_id_fkey (
              id,
              name,
              first_name,
              last_name,
              email
            )
          `)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (iposError) throw iposError;

        if (!approvedIpos) {
          setArtworks([]);
          return;
        }

        // Transform IPO data to match Artwork type
        const transformedArtworks: Artwork[] = approvedIpos.map(ipo => ({
          id: ipo.artwork?.id || ipo.id,
          title: ipo.title,
          artist: ipo.user?.name || 'Artista',
          artistName: ipo.user?.first_name && ipo.user?.last_name 
            ? `${ipo.user.first_name} ${ipo.user.last_name}`
            : ipo.user?.name || 'Artista',
          description: ipo.description || '',
          imageUrl: ipo.image_url,
          additionalImages: [],
          pricePerShare: ipo.price_per_share,
          initialPricePerShare: ipo.price_per_share,
          percentageChange: 0,
          totalShares: ipo.total_shares,
          investorsCount: 0,
          createdAt: ipo.created_at,
          categories: [ipo.category],
          originalPrice: ipo.price_per_share * ipo.total_shares
        }));

        setArtworks(transformedArtworks);
      } catch (error) {
        console.error('Error fetching artworks:', error);
        setError('Failed to load artworks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  const filteredAndSortedArtworks = useMemo(() => {
    let filtered = [...artworks];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        artwork => 
          artwork.title.toLowerCase().includes(searchLower) ||
          artwork.artist.toLowerCase().includes(searchLower)
      );
    }
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(artwork =>
        artwork.categories.some(category => selectedCategories.includes(category))
      );
    }
    
    filtered = filtered.filter(artwork => {
      const meetsMinPrice = artwork.pricePerShare >= priceRange.min;
      const meetsMaxPrice = priceRange.max === null || artwork.pricePerShare <= priceRange.max;
      return meetsMinPrice && meetsMaxPrice;
    });
    
    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'price-high':
          return b.pricePerShare - a.pricePerShare;
        case 'price-low':
          return a.pricePerShare - b.pricePerShare;
        case 'investors':
          return b.investorsCount - a.investorsCount;
        case 'change-high':
          return b.percentageChange - a.percentageChange;
        case 'change-low':
          return a.percentageChange - b.percentageChange;
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [artworks, searchTerm, selectedCategories, sortOption, priceRange]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: null });
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mercado de Arte</h1>
        <p className="text-gray-600">Descubra e invista em obras de arte exclusivas</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
            placeholder="Buscar obras ou artistas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            type="button"
            className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md ${
              showFilters
                ? 'border-black text-white bg-black'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {selectedCategories.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                {selectedCategories.length}
              </span>
            )}
          </button>
          
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => {
                const dropdown = document.getElementById('sort-dropdown');
                if (dropdown) {
                  dropdown.classList.toggle('hidden');
                }
              }}
            >
              <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
              Ordenar
            </button>
            <div id="sort-dropdown" className="hidden absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu">
                <button
                  className={`block px-4 py-2 text-sm w-full text-left ${sortOption === 'recent' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setSortOption('recent')}
                >
                  Mais recentes
                </button>
                <button
                  className={`block px-4 py-2 text-sm w-full text-left ${sortOption === 'price-high' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setSortOption('price-high')}
                >
                  Preço: Maior para menor
                </button>
                <button
                  className={`block px-4 py-2 text-sm w-full text-left ${sortOption === 'price-low' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setSortOption('price-low')}
                >
                  Preço: Menor para maior
                </button>
                <button
                  className={`block px-4 py-2 text-sm w-full text-left ${sortOption === 'investors' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setSortOption('investors')}
                >
                  Mais cotistas
                </button>
                <button
                  className={`block px-4 py-2 text-sm w-full text-left ${sortOption === 'change-high' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setSortOption('change-high')}
                >
                  Valorização: Maior para menor
                </button>
                <button
                  className={`block px-4 py-2 text-sm w-full text-left ${sortOption === 'change-low' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setSortOption('change-low')}
                >
                  Valorização: Menor para maior
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar filtros
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Categorias</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCategories.includes(category)
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Faixa de preço por cota</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Mínimo (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Máximo (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={priceRange.max || ''}
                    onChange={(e) => setPriceRange(prev => ({ 
                      ...prev, 
                      max: e.target.value ? Number(e.target.value) : null 
                    }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {filteredAndSortedArtworks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">
            {error ? 'Erro ao carregar obras' : 'Nenhuma obra aprovada disponível no momento'}
          </p>
          {selectedCategories.length > 0 || searchTerm || priceRange.min > 0 || priceRange.max !== null ? (
            <Button onClick={clearFilters}>
              Limpar filtros
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Market;