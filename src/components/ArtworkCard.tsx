import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';
import { Artwork } from '../types';
import BuySharesDialog from './BuySharesDialog';
import SellSharesDialog from './SellSharesDialog';
import { useAuth } from '../contexts/AuthContext';

interface ArtworkCardProps {
  artwork: Artwork;
  userShares?: number;
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork, userShares = 0 }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const isPositiveChange = artwork.percentageChange >= 0;
  
  const handleBuyClick = () => {
    if (!user) {
      navigate('/login', { state: { from: `/artwork/${artwork.id}` } });
      return;
    }
    setBuyDialogOpen(true);
  };

  const handleSellClick = () => {
    if (!user) {
      navigate('/login', { state: { from: `/artwork/${artwork.id}` } });
      return;
    }
    if (userShares === 0) {
      alert('Você não possui cotas desta obra');
      return;
    }
    setSellDialogOpen(true);
  };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <img 
            src={artwork.imageUrl} 
            alt={artwork.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
            <h3 className="font-medium truncate">{artwork.title}</h3>
            <p className="text-sm text-gray-200 truncate">por {artwork.artistName || artwork.artist}</p>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs text-gray-500">Valor por cota</p>
              <p className="text-lg font-bold">R$ {artwork.pricePerShare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className={`flex items-center ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveChange ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span className="font-medium">{isPositiveChange ? '+' : ''}{artwork.percentageChange.toFixed(2)}%</span>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm mb-4">
            <Users className="w-4 h-4 mr-1" />
            <span>{artwork.investorsCount} cotistas</span>
          </div>
          
          <div className="flex space-x-2">
            <button 
              className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800 transition"
              onClick={handleBuyClick}
            >
              Comprar
            </button>
            <button 
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 transition"
              onClick={handleSellClick}
            >
              Vender
            </button>
          </div>
          
          <Link 
            to={`/artwork/${artwork.id}`} 
            className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-3"
          >
            Ver detalhes
          </Link>
        </div>
      </div>

      {user && (
        <>
          <BuySharesDialog
            artwork={artwork}
            open={buyDialogOpen}
            onOpenChange={setBuyDialogOpen}
          />

          <SellSharesDialog
            artwork={artwork}
            userShares={userShares}
            open={sellDialogOpen}
            onOpenChange={setSellDialogOpen}
          />
        </>
      )}
    </>
  );
};

export default ArtworkCard;