# 🎨 Cotarte - Tokenização de Obras de Arte

A Cotarte é uma plataforma que democratiza o acesso ao mercado da arte por meio da tokenização de obras. Artistas podem lançar IPOs (Ofertas Públicas de Obras), permitindo que investidores adquiram cotas de suas obras favoritas de forma segura e transparente.

## ✨ Visão

A Cotarte nasceu com o propósito de ajudar artistas visuais emergentes a se conectarem com o mercado de investimentos. Idealizada por Carlos H S B Silva, artista visual, a plataforma une tecnologia, arte e propósito social para transformar o acesso à arte em um investimento acessível e significativo.

---

## ⚙️ Como Funciona

### Para Artistas:
- Cadastre sua obra (nome, descrição, imagem, valor e número de cotas).
- A plataforma cria automaticamente uma oferta (IPO) para investimento.
- Assim que aprovada, a obra é listada no marketplace.

### Para Investidores:
- Deposite valores via Stripe.
- Compre cotas de obras disponíveis no marketplace.
- Acompanhe a valorização proporcional das obras.
- Negocie cotas no mercado secundário.

---

## 📈 Lógica de Valorização

- Valor de mercado da obra aumenta proporcionalmente às cotas vendidas.
- Fórmula: `valor_de_mercado = valor_original × (1 + (cotas_vendidas ÷ cotas_totais))`
- Cotação da cota: `valor_de_mercado ÷ cotas_disponíveis`

---

## 💸 Taxas

- 5% sobre o valor arrecadado no IPO.
- 2,5% por transação no mercado secundário.

---

## 📚 Educação e Transparência

Na aba "Sobre", o usuário encontra:
- A história da Cotarte
- Conceitos de tokenização e investimento em arte
- Simulador de retorno de investimento
- Conteúdo educativo para novos investidores

---

## 🧰 Tecnologias

- **Supabase** (Banco de dados, autenticação, armazenamento, funções SQL)
- **Bolt.new** (Frontend baseado em React)
- **Stripe** (Integração para depósitos)
- **PostgreSQL** (Lógica de valorização via triggers)
- **Tailwind CSS** (Estilização via Bolt ou React)

---

## 🛠️ Desenvolvimento futuro

- Módulo de saque via Pix ou PayPal
- Página pública de perfil do artista
- Integração com NFTs (opcional)
- Notificações de valorização de cotas
- App mobile

---

## 👨‍💻 Desenvolvedor

Feito com 💡 e 💻 por **Carlos H S B Silva**  
Contato: [seu email/site/redes sociais]

---

## 📜 Licença

Este projeto é de código fechado até segunda ordem. Todos os direitos reservados.

