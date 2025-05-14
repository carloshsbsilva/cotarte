import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { mockArtworks } from '../data/mockData';

const Home: React.FC = () => {
  // Get success and failure cases
  const successCases = mockArtworks
    .filter(artwork => artwork.percentageChange > 0)
    .sort((a, b) => b.percentageChange - a.percentageChange)
    .slice(0, 3);

  const failureCases = mockArtworks
    .filter(artwork => artwork.percentageChange < 0)
    .sort((a, b) => a.percentageChange - b.percentageChange)
    .slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-black rounded-2xl overflow-hidden mb-12">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1647121/pexels-photo-1647121.jpeg"
            alt="Art Gallery"
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="relative px-8 py-24 sm:px-12 sm:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Invista em Arte
            </h1>
            <p className="mt-6 text-xl text-gray-300">
              Democratizando o acesso ao mercado de arte através da tokenização de obras.
              Comece a investir com pequenos valores em obras de artistas renomados.
            </p>
            <div className="mt-10 flex gap-4">
              <Link
                to="/market"
                className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-black shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Explorar Mercado
              </Link>
              <a
                href="#how-it-works"
                className="rounded-md bg-white/10 px-6 py-3 text-lg font-semibold text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Como Funciona
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Latest News */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Últimas Notícias</h2>
          <Link to="/news" className="text-black hover:text-gray-600 flex items-center">
            Ver todas
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img
              src="https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg"
              alt="Art Exhibition"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <span className="text-sm text-gray-500">22 Fev 2025</span>
              <h3 className="mt-2 text-xl font-semibold text-gray-900">
                Nova exposição bate recorde de valorização
              </h3>
              <p className="mt-2 text-gray-600">
                Obras da exposição "Reflexos Modernos" apresentam valorização média de 45% em apenas três meses.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img
              src="https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg"
              alt="Digital Art"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <span className="text-sm text-gray-500">20 Fev 2025</span>
              <h3 className="mt-2 text-xl font-semibold text-gray-900">
                Arte digital ganha espaço no mercado
              </h3>
              <p className="mt-2 text-gray-600">
                Artistas digitais veem crescimento de 300% nas vendas através de tokenização.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img
              src="https://images.pexels.com/photos/1579708/pexels-photo-1579708.jpeg"
              alt="Art Investment"
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <span className="text-sm text-gray-500">18 Fev 2025</span>
              <h3 className="mt-2 text-xl font-semibold text-gray-900">
                Investidores jovens dominam mercado
              </h3>
              <p className="mt-2 text-gray-600">
                Pesquisa revela que 65% dos investidores em arte tokenizada têm menos de 35 anos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Cases */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Maiores Valorizações</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successCases.map(artwork => (
            <Link
              key={artwork.id}
              to={`/artwork/${artwork.id}`}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-semibold text-gray-900">{artwork.title}</h3>
                <p className="text-gray-600">{artwork.artist}</p>
                <div className="mt-4 flex items-center text-green-600">
                  <TrendingUp className="h-5 w-5 mr-1" />
                  <span className="font-semibold">+{artwork.percentageChange.toFixed(2)}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Failure Cases */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Maiores Desvalorizações</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {failureCases.map(artwork => (
            <Link
              key={artwork.id}
              to={`/artwork/${artwork.id}`}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-semibold text-gray-900">{artwork.title}</h3>
                <p className="text-gray-600">{artwork.artist}</p>
                <div className="mt-4 flex items-center text-red-600">
                  <TrendingDown className="h-5 w-5 mr-1" />
                  <span className="font-semibold">{artwork.percentageChange.toFixed(2)}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div id="how-it-works" className="bg-white rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Como Funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="h-12 w-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold mb-4">
              1
            </div>
            <h3 className="text-lg font-semibold mb-2">Escolha uma Obra</h3>
            <p className="text-gray-600">
              Explore nossa galeria de obras disponíveis e escolha aquelas que mais
              combinam com seu perfil de investimento.
            </p>
          </div>
          <div>
            <div className="h-12 w-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold mb-2">Compre Cotas</h3>
            <p className="text-gray-600">
              Invista o valor que desejar comprando cotas da obra. Cada cota
              representa uma fração do valor total da obra.
            </p>
          </div>
          <div>
            <div className="h-12 w-12 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold mb-2">Acompanhe e Negocie</h3>
            <p className="text-gray-600">
              Acompanhe a valorização das suas cotas e negocie no mercado
              secundário quando desejar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;