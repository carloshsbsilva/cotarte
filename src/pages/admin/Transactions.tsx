import React, { useState } from 'react';
import { 
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar,
  FileText
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { mockTransactions } from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';
import { Transaction } from '../../types';

const Transactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'buy' | 'sell' | 'physical_sale'>('all');

  // Calculate total revenue
  const totalRevenue = mockTransactions.reduce((sum, tx) => sum + tx.platformFee, 0);
  const monthlyRevenue = mockTransactions
    .filter(tx => new Date(tx.date).getMonth() === new Date().getMonth())
    .reduce((sum, tx) => sum + tx.platformFee, 0);

  // Filter transactions
  const filteredTransactions = mockTransactions.filter(tx => {
    const matchesSearch = 
      tx.artworkTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

    const txDate = new Date(tx.date);
    const now = new Date();

    switch (dateFilter) {
      case 'today':
        return txDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return txDate >= weekAgo;
      case 'month':
        return txDate.getMonth() === now.getMonth() && 
               txDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });

  const getTransactionTypeStyle = (type: Transaction['type']) => {
    switch (type) {
      case 'buy':
        return 'bg-green-100 text-green-800';
      case 'sell':
        return 'bg-red-100 text-red-800';
      case 'physical_sale':
        return 'bg-purple-100 text-purple-800';
    }
  };

  const getTransactionTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'buy':
        return 'Compra';
      case 'sell':
        return 'Venda';
      case 'physical_sale':
        return 'Venda Física';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transações</h1>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Receita Total</h3>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
          <p className="text-sm text-gray-500 mt-2">
            em comissões da plataforma
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Receita Mensal</h3>
          <p className="text-2xl font-bold mt-1">{formatCurrency(monthlyRevenue)}</p>
          <p className="text-sm text-gray-500 mt-2">
            no mês atual
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por ID, obra ou usuário..."
            className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
          >
            <option value="all">Todas as datas</option>
            <option value="today">Hoje</option>
            <option value="week">Última semana</option>
            <option value="month">Este mês</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
          >
            <option value="all">Todos os tipos</option>
            <option value="buy">Compras</option>
            <option value="sell">Vendas</option>
            <option value="physical_sale">Vendas Físicas</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Mais filtros
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID / Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Obra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comprador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cotas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comissão
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{tx.id}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(tx.date).toLocaleString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tx.artworkTitle}</div>
                    <div className="text-sm text-gray-500">ID: {tx.artworkId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeStyle(tx.type)}`}>
                      {tx.type === 'buy' && <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {tx.type === 'sell' && <ArrowUpRight className="h-3 w-3 mr-1" />}
                      {getTransactionTypeLabel(tx.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tx.buyer.name}</div>
                    <div className="text-sm text-gray-500">{tx.buyer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tx.seller.name}</div>
                    <div className="text-sm text-gray-500">{tx.seller.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tx.shares}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(tx.totalAmount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(tx.pricePerShare)} / cota
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      {formatCurrency(tx.platformFee)}
                    </div>
                    <div className="text-xs text-gray-500">
                      5%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma transação encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;