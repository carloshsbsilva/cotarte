import React from 'react';
import { AlertCircle, Clock, X, Check } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface IPO {
  id: string;
  title: string;
  image_url: string;
  price_per_share: number;
  total_shares: number;
  status: 'pending' | 'approved' | 'rejected';
  admin_feedback?: string;
  created_at: string;
}

interface PendingIPOsListProps {
  ipos: IPO[];
}

const PendingIPOsList: React.FC<PendingIPOsListProps> = ({ ipos }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">IPOs Pendentes</h3>
      </div>
      
      {ipos.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum IPO pendente</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {ipos.map((ipo) => (
            <div key={ipo.id} className="p-6">
              <div className="flex items-start">
                <img
                  src={ipo.image_url}
                  alt={ipo.title}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">{ipo.title}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ipo.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : ipo.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {ipo.status === 'pending' && (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Pendente
                        </>
                      )}
                      {ipo.status === 'approved' && (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Aprovado
                        </>
                      )}
                      {ipo.status === 'rejected' && (
                        <>
                          <X className="w-3 h-3 mr-1" />
                          Rejeitado
                        </>
                      )}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Valor por cota</p>
                      <p className="font-medium">{formatCurrency(ipo.price_per_share)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total de cotas</p>
                      <p className="font-medium">{ipo.total_shares}</p>
                    </div>
                  </div>
                  {ipo.status === 'rejected' && ipo.admin_feedback && (
                    <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-1">Motivo da rejeição:</p>
                      <p className="text-sm">{ipo.admin_feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingIPOsList;