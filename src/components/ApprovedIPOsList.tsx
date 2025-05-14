import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import { Button } from './ui/button';
import { formatCurrency } from '../lib/utils';

interface IPO {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price_per_share: number;
  total_shares: number;
  artwork?: {
    id: string;
    image_url: string;
  };
}

interface ApprovedIPOsListProps {
  ipos: IPO[];
}

const ApprovedIPOsList: React.FC<ApprovedIPOsListProps> = ({ ipos }) => {
  const navigate = useNavigate();

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ipos.map(ipo => (
        <div key={ipo.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="h-48 bg-gray-100 relative">
            {getImageUrl(ipo) ? (
              <img
                src={getImageUrl(ipo)}
                alt={ipo.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageOff className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-medium text-lg mb-2">{ipo.title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {ipo.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Valor por cota</span>
                <span className="font-medium">
                  {formatCurrency(ipo.price_per_share)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total de cotas</span>
                <span className="font-medium">{ipo.total_shares}</span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() => navigate(`/artwork/${ipo.artwork?.id || ipo.id}`)}
            >
              Comprar cotas
            </Button>
          </div>
        </div>
      ))}

      {ipos.length === 0 && (
        <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nenhuma obra aprovada encontrada</p>
        </div>
      )}
    </div>
  );
};

export default ApprovedIPOsList;