import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { UserInvestment } from '../types';
import BuySharesDialog from './BuySharesDialog';
import SellSharesDialog from './SellSharesDialog';

interface UserPortfolioCardProps {
  investment: UserInvestment;
}

const UserPortfolioCard: React.FC<UserPortfolioCardProps> = ({ investment }) => {
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  
  const isPositiveChange = investment.percentageChange >= 0;
  const totalValue = investment.shares * investment.currentPricePerShare;
  const initialValue = investment.shares * investment.initialPricePerShare;
  const profit = totalValue - initialValue;
  
  const artwork = {
    id: investment.artworkId,
    title: investment.artworkTitle,
    pricePerShare: investment.currentPricePerShare,
    totalShares: 100 // This would come from the actual artwork data
  };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <div className="flex items-center p-4">
          <div className="h-16 w-16 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
            <img 
              src={investment.artworkImageUrl} 
              alt={investment.artworkTitle} 
              className="h-full w-full object-cover"
            />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="font-medium text-gray-900">{investment.artworkTitle}</h3>
            <p className="text-sm text-gray-500">{investment.artistName}</p>
          </div>
          <div className={`text-right ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
            <div className="flex items-center justify-end">
              {isPositiveChange ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span className="font-medium">{isPositiveChange ? '+' : ''}{investment.percentageChange.toFixed(2)}%</span>
            </div>
            <p className="text-xs mt-1">desde a compra</p>
          </div>
        </div>
        
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">Cotas</p>
              <p className="font-medium">{investment.shares}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Valor atual</p>
              <p className="font-medium">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className={isPositiveChange ? 'text-green-600' : 'text-red-600'}>
              <p className="text-xs text-gray-500">Lucro/Prejuízo</p>
              <p className="font-medium">
                {isPositiveChange ? '+' : ''}
                R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 flex space-x-2">
          <button 
            className="flex-1 bg-black text-white py-2 rounded-md text-sm hover:bg-gray-800 transition"
            onClick={() => setBuyDialogOpen(true)}
          >
            Comprar mais
          </button>
          <button 
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md text-sm hover:bg-gray-50 transition"
            onClick={() => setSellDialogOpen(true)}
          >
            Vender
          </button>
          <Link 
            to={`/artwork/${investment.artworkId}`}
            className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm hover:bg-gray-50 transition"
          >
            Detalhes
          </Link>
        </div>
      </div>

      <BuySharesDialog
        artwork={artwork}
        open={buyDialogOpen}
        onOpenChange={setBuyDialogOpen}
      />

      <SellSharesDialog
        artwork={artwork}
        userShares={investment.shares}
        open={sellDialogOpen}
        onOpenChange={setSellDialogOpen}
      />
    </>
  );
};

export default UserPortfolioCard;