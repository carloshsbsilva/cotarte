import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Check, 
  X, 
  AlertCircle,
  Eye,
  ImageOff
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';

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
  user: {
    name: string;
    email: string;
  };
  artwork?: {
    id: string;
    image_url: string;
  };
}

const IPOModeration: React.FC = () => {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchIPOs();
  }, []);

  const fetchIPOs = async () => {
    try {
      const { data, error } = await supabase
        .from('ipos')
        .select(`
          *,
          user:profiles(name, email),
          artwork:artworks(id, image_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIpos(data || []);
    } catch (error) {
      console.error('Error fetching IPOs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ipoId: string) => {
    try {
      const { error } = await supabase.rpc('approve_ipo', {
        p_ipo_id: ipoId
      });

      if (error) throw error;
      fetchIPOs();
    } catch (error) {
      console.error('Error approving IPO:', error);
      alert('Erro ao aprovar IPO. Verifique se o usuário tem saldo suficiente.');
    }
  };

  const handleReject = async (ipoId: string, feedback: string) => {
    try {
      const { error } = await supabase.rpc('reject_ipo', {
        p_ipo_id: ipoId,
        p_admin_feedback: feedback
      });

      if (error) throw error;
      fetchIPOs();
    } catch (error) {
      console.error('Error rejecting IPO:', error);
      alert('Erro ao rejeitar IPO');
    }
  };

  const getImageUrl = (ipo: IPO): string => {
    // First try the IPO's image_url
    if (ipo.image_url) {
      return ipo.image_url;
    }

    // Then try the artwork's image_url if available
    if (ipo.artwork?.image_url) {
      return ipo.artwork.image_url;
    }

    // Return default placeholder image if no other image is available
    return 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loop
    target.src = 'https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg';
  };

  const filteredIPOs = ipos.filter(ipo => {
    const matchesSearch = 
      ipo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ipo.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && ipo.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Moderação de IPOs</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título ou artista..."
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovados</option>
            <option value="rejected">Rejeitados</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* IPOs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Obra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artista
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor por Cota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total de Cotas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredIPOs.map((ipo) => (
                <tr key={ipo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {getImageUrl(ipo) ? (
                          <img
                            src={getImageUrl(ipo)}
                            alt={ipo.title}
                            className="h-full w-full object-cover"
                            onError={handleImageError}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageOff className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{ipo.title}</div>
                        <div className="text-sm text-gray-500">{ipo.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ipo.user.name}</div>
                    <div className="text-sm text-gray-500">{ipo.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      R$ {ipo.price_per_share.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ipo.total_shares}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ipo.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : ipo.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {ipo.status === 'pending' && 'Pendente'}
                      {ipo.status === 'approved' && 'Aprovado'}
                      {ipo.status === 'rejected' && 'Rejeitado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {ipo.status === 'pending' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(ipo.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              const feedback = prompt('Motivo da rejeição:');
                              if (feedback) handleReject(ipo.id, feedback);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredIPOs.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum IPO encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IPOModeration;