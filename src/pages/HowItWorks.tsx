import React from 'react';
import { Palette, TrendingUp, DollarSign, Users } from 'lucide-react';

const HowItWorks: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Como Funciona</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A plataforma foi desenvolvida por Carlos H S B Silva com o auxílio de Inteligência Artificial, 
          com a missão de democratizar o acesso ao mercado de arte por meio da tokenização de obras. 
          Como artista visual emergente, Carlos buscou criar uma solução que conecta artistas iniciantes a investidores.
        </p>
      </div>

      {/* Process Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <Palette className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">1. Tokenização</h3>
          <p className="text-gray-600">
            Obras de arte são divididas em cotas digitais (tokens), permitindo investimento fracionado 
            e democratizando o acesso ao mercado de arte.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">2. IPO</h3>
          <p className="text-gray-600">
            Initial Public Offering - primeira oferta pública de cotas. O artista define o valor inicial 
            e número de cotas disponíveis.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="h-12 w-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <DollarSign className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">3. Valorização</h3>
          <p className="text-gray-600">
            O valor das cotas aumenta conforme a demanda. A fórmula considera o número de cotas vendidas 
            e o interesse do mercado.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold mb-2">4. Mercado Secundário</h3>
          <p className="text-gray-600">
            Após o IPO, investidores podem comprar e vender cotas entre si, gerando liquidez e 
            oportunidades de lucro.
          </p>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-16">
        <section>
          <h2 className="text-2xl font-bold mb-6">Como Investir</h2>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <ol className="space-y-4">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 bg-black text-white rounded-full flex items-center justify-center mr-3">1</span>
                <div>
                  <h4 className="font-medium">Crie sua conta</h4>
                  <p className="text-gray-600">Registre-se gratuitamente e escolha seu perfil (investidor ou artista).</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 bg-black text-white rounded-full flex items-center justify-center mr-3">2</span>
                <div>
                  <h4 className="font-medium">Adicione saldo</h4>
                  <p className="text-gray-600">Deposite fundos em sua carteira virtual usando cartão de crédito ou PIX.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 bg-black text-white rounded-full flex items-center justify-center mr-3">3</span>
                <div>
                  <h4 className="font-medium">Escolha obras</h4>
                  <p className="text-gray-600">Explore o marketplace e selecione obras para investir.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 bg-black text-white rounded-full flex items-center justify-center mr-3">4</span>
                <div>
                  <h4 className="font-medium">Compre cotas</h4>
                  <p className="text-gray-600">Adquira cotas das obras escolhidas e acompanhe sua valorização.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Taxas e Custos</h2>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">IPO (Mercado Primário)</h4>
                <p className="text-gray-600">Taxa de 5% sobre o valor total arrecadado na primeira oferta.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Mercado Secundário</h4>
                <p className="text-gray-600">Taxa de 2,5% em cada transação de compra/venda entre usuários.</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Depósitos e Saques</h4>
                <p className="text-gray-600">Sem taxas adicionais além das cobradas pelos provedores de pagamento.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Venda da Obra Física</h2>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="space-y-4">
              <p className="text-gray-600">
                Quando a obra física é vendida, o valor é distribuído proporcionalmente entre todos os cotistas, 
                de acordo com a quantidade de cotas que cada um possui.
              </p>
              <p className="text-gray-600">
                O processo é transparente e automatizado, com o valor sendo creditado diretamente na carteira 
                virtual de cada investidor.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Segurança e Transparência</h2>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="space-y-4">
              <p className="text-gray-600">
                Todas as transações são registradas e podem ser auditadas. O sistema de valorização é 
                automático e segue regras claras e predefinidas.
              </p>
              <p className="text-gray-600">
                A plataforma utiliza tecnologias modernas de segurança e criptografia para proteger 
                dados e transações dos usuários.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowItWorks;