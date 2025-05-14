import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Palette, 
  ArrowUpRight,
  ArrowDownRight,
  DollarSign
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatCurrency } from '../../lib/utils';

const Dashboard: React.FC = () => {
  const stats = {
    revenue: {
      total: 125000.00,
      monthly: 15000.00,
      change: 12.5
    },
    artworks: {
      total: 48,
      pending: 5,
      active: 43
    },
    users: {
      total: 256,
      artists: 32,
      investors: 224
    },
    transactions: {
      total: 1280,
      volume: 450000.00,
      average: 351.56
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline">Exportar Relatório</Button>
          <Button>Nova Obra</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className={`flex items-center ${stats.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.revenue.change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              <span className="ml-1">{Math.abs(stats.revenue.change)}%</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Receita Total</h3>
          <p className="text-2xl font-bold mt-1">{formatCurrency(stats.revenue.total)}</p>
          <p className="text-sm text-gray-500 mt-2">
            {formatCurrency(stats.revenue.monthly)} este mês
          </p>
        </div>

        {/* Artworks Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Palette className="h-6 w-6 text-purple-600" />
            </div>
            <Link to="/admin/obras" className="text-sm text-gray-500 hover:text-gray-700">
              Ver todas
            </Link>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Obras de Arte</h3>
          <p className="text-2xl font-bold mt-1">{stats.artworks.total}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.artworks.pending} obras pendentes
          </p>
        </div>

        {/* Users Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <Link to="/admin/usuarios" className="text-sm text-gray-500 hover:text-gray-700">
              Ver todos
            </Link>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Usuários</h3>
          <p className="text-2xl font-bold mt-1">{stats.users.total}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.users.artists} artistas, {stats.users.investors} investidores
          </p>
        </div>

        {/* Transactions Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <Link to="/admin/transacoes" className="text-sm text-gray-500 hover:text-gray-700">
              Ver todas
            </Link>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Transações</h3>
          <p className="text-2xl font-bold mt-1">{stats.transactions.total}</p>
          <p className="text-sm text-gray-500 mt-2">
            Volume: {formatCurrency(stats.transactions.volume)}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Atividade Recente</h2>
        <div className="space-y-4">
          {/* Activity items would go here */}
          <p className="text-gray-500 text-center py-4">Carregando atividades recentes...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;