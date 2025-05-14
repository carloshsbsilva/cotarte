import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, Palette, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Only navigate after successful sign out
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during sign out:', error);
      // Navigate to login even if there's an error
      navigate('/login', { replace: true });
    } finally {
      // Ensure menu is closed regardless of sign out success/failure
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <Palette className="h-8 w-8 text-gray-900" />
                <span className="ml-2 text-2xl font-semibold text-gray-900">Cotarte</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              <Link 
                to="/market" 
                className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/market' ? 'bg-gray-100' : ''
                }`}
              >
                Mercado
              </Link>
              <Link 
                to="/news" 
                className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/news' ? 'bg-gray-100' : ''
                }`}
              >
                Notícias
              </Link>
              {user && <NotificationBell />}
              {user ? (
                <>
                  <Link 
                    to="/new-ipo" 
                    className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Nova Obra + IPO
                  </Link>
                  <Link 
                    to="/portfolio" 
                    className={`text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/portfolio' ? 'bg-gray-100' : ''
                    }`}
                  >
                    Portfólio
                  </Link>
                  <Link 
                    to="/profile" 
                    className={`flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/profile' ? 'bg-gray-100' : ''
                    }`}
                  >
                    <User className="h-5 w-5 mr-1" />
                    <span>Perfil</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    <span>Sair</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <User className="h-5 w-5 mr-1" />
                    <span>Entrar</span>
                  </Link>
                </>
              )}
            </nav>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Abrir menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/market"
                className={`block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 ${
                  location.pathname === '/market' ? 'bg-gray-100' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Mercado
              </Link>
              <Link
                to="/news"
                className={`block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 ${
                  location.pathname === '/news' ? 'bg-gray-100' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Notícias
              </Link>
              {user ? (
                <>
                  <Link
                    to="/new-ipo"
                    className="block px-3 py-2 text-base font-medium text-gray-900 bg-gray-100 hover:bg-gray-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Nova Obra + IPO
                  </Link>
                  <Link
                    to="/portfolio"
                    className={`block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 ${
                      location.pathname === '/portfolio' ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Portfólio
                  </Link>
                  <Link
                    to="/profile"
                    className={`block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 ${
                      location.pathname === '/profile' ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-2 inline" />
                    <span>Perfil</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-2 inline" />
                    <span>Sair</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-2 inline" />
                    <span>Entrar</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <Palette className="h-6 w-6 text-gray-900" />
                <span className="ml-2 text-xl font-semibold text-gray-900">Cotarte</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">A bolsa de valores da arte</p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Plataforma</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Como funciona</a></li>
                  <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Taxas</a></li>
                  <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Legal</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Termos</a></li>
                  <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacidade</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Contato</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Suporte</a></li>
                  <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">contato@cotarte.com</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-900">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-900">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
            <p className="mt-8 text-base text-gray-500 md:mt-0 md:order-1">
              &copy; 2025 Cotarte. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;