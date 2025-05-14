import React from 'react';
import { Shield } from 'lucide-react';

interface BadgeProps {
  type: 'quoted' | 'ipo-ending' | 'last-chance';
}

const ArtworkBadge: React.FC<BadgeProps> = ({ type }) => {
  const getBadgeStyle = () => {
    switch (type) {
      case 'quoted':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: 'text-blue-500'
        };
      case 'ipo-ending':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: 'text-yellow-500'
        };
      case 'last-chance':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'text-red-500'
        };
    }
  };
  
  const style = getBadgeStyle();
  
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border ${style.bg} ${style.border}`}>
      <Shield className={`h-4 w-4 mr-1 ${style.icon}`} />
      <span className={`text-sm font-medium ${style.text}`}>
        {type === 'quoted' && 'Obra Cotada'}
        {type === 'ipo-ending' && 'IPO Encerrando'}
        {type === 'last-chance' && 'Última Chance'}
      </span>
    </div>
  );
};

export default ArtworkBadge;