# Vivaê

Plataforma de eventos com catálogo externo, organização de eventos, compra
simulada de ingressos e validação de entrada por QR Code.

O repositório é dividido em:

```text
Verzel/
├── Backend/   NestJS, Prisma e PostgreSQL
└── Frontend/  React, TypeScript e Vite
```

Este README é o documento principal do projeto. Conforme novas funcionalidades
forem concluídas, ele será atualizado em vez de substituído por documentos
separados.

## Origem e construção do frontend

As referências visuais e os HTMLs iniciais foram gerados com o Google Stitch.
Esse material serviu como ponto de partida para o design, com aparência natural
e próxima de uma interface construída para um produto real.

A aplicação final não executa os HTMLs gerados. As telas foram analisadas e
convertidas manualmente para React com TypeScript. Durante essa conversão:

- o HTML foi dividido em páginas e componentes reutilizáveis;
- comportamentos estáticos foram transformados em estado e hooks React;
- as páginas receberam rotas com React Router;
- os dados foram tipados com interfaces TypeScript;
- animações e responsividade foram preservadas e refinadas;
- chamadas HTTP foram centralizadas com Axios;
- autenticação, cargos, paginação, filtros e estados de erro foram integrados;
- o fluxo visual foi adaptado às regras reais do domínio de ingressos.

Portanto, o Google Stitch foi utilizado como ferramenta de concepção visual,
enquanto a estrutura, a componentização, a integração e a lógica em React foram
implementadas manualmente no projeto.

## Tecnologias

### Frontend

- React 19;
- TypeScript;
- Vite;
- React Router DOM;
- Axios;
- CSS responsivo próprio.

### Backend

- NestJS 11;
- TypeScript;
- Prisma ORM;
- PostgreSQL;
- JWT;
- bcrypt;
- Ticketmaster Discovery API v2.

## Executando localmente

### Backend

```bash
cd Backend
npm install
npx prisma generate
npm run start:dev
```

O backend utiliza por padrão:

```text
http://localhost:3000
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

O frontend utiliza por padrão:

```text
http://localhost:5173
```

## Variáveis de ambiente

Crie `Backend/.env` e configure:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/verzel"
JWT_SECRET="segredo-do-access-token"
JWT_REFRESH_SECRET="segredo-diferente-para-refresh-token"
TICKET_MASTER_CONSUMER_KEY="chave-da-ticketmaster"
PORT=3000
```

Nunca publique o `.env`. `JWT_SECRET` e `JWT_REFRESH_SECRET` devem ser valores
fortes e diferentes.

## Autenticação

### Cadastro

```http
POST /auth/register
```

### Login

```http
POST /auth/login
```

O login devolve:

- access token com duração de 15 minutos;
- refresh token com duração de 7 dias;
- informações básicas do usuário.

### Renovação de tokens

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "TOKEN"
}
```

O backend valida o refresh token com `JWT_REFRESH_SECRET`, confirma que o
usuário existe e está ativo e devolve um novo access token e um novo refresh
token.

No frontend, o interceptor do Axios executa automaticamente este fluxo:

```text
Requisição protegida
        ↓
Access token expirou e o backend respondeu 401
        ↓
POST /auth/refresh
        ↓
Salva o novo par de tokens
        ↓
Repete a requisição original uma vez
```

Chamadas simultâneas compartilham a mesma tentativa de renovação. Se o refresh
token estiver ausente, inválido ou expirado, a sessão local é removida e o
usuário volta para o login.

O refresh atual é stateless. O logout remove os tokens do navegador, mas não
revoga remotamente um token já emitido. Uma evolução futura é persistir sessões
ou hashes de refresh tokens para permitir revogação e logout por dispositivo.

## Usuários e autorização

Os cargos globais são:

| Cargo        | Responsabilidade                       |
| ------------ | -------------------------------------- |
| `CUSTOMER`   | Consultar eventos e comprar ingressos  |
| `ORGANIZER`  | Criar e administrar eventos            |
| `GATE_STAFF` | Validar ingressos na portaria          |
| `ADMIN`      | Acessar todas as áreas administrativas |

O frontend consulta `GET /users/informations` antes de abrir áreas restritas.
Essa proteção melhora a navegação, mas as rotas sensíveis também devem validar
autenticação e autorização no backend.

## Catálogo Ticketmaster

A integração externa passa sempre pelo backend para não expor a chave:

```text
Frontend -> Backend -> Ticketmaster Discovery API
```

Rotas atuais:

```http
GET /catalog-events/ticketmaster?keyword=rock&page=0
GET /catalog-events/ticketmaster/:eventId
GET /catalog-events/ticketmaster/venues/:venueId
```

O catálogo aproveita, quando disponíveis:

- nome e ID do evento;
- imagens;
- data e horário;
- classificações;
- descrição, informações e avisos;
- atração relacionada;
- local, cidade e endereço;
- faixa de preço e moeda.

Nem todos os eventos possuem descrição ou `priceRanges`. Quando o preço não é
informado, a interface mostra “Consulte os ingressos” em vez de inventar um
valor.

## Eventos e preços locais

A Ticketmaster é uma fonte de catálogo, não a fonte de estoque do Vivaê. Depois
de importar uma referência externa, o organizador deverá configurar:

- evento local;
- local e sessões;
- modalidade de venda;
- setores ou tipos de ingresso;
- lotes;
- preços e taxas;
- capacidade e estoque;
- mapa de assentos, quando aplicável.

Os preços dos lotes locais serão a fonte de verdade para a compra simulada. A
faixa retornada pela Ticketmaster serve somente como informação de referência.

## Compra simulada

O acesso a ingressos, assentos, checkout, resultado da compra e ingressos do
usuário exige login.

O `eventId` acompanha o fluxo:

```text
/eventos/:id
  -> /ingressos?eventId=:id
  -> /checkout?eventId=:id
  -> /sucesso?eventId=:id
  -> /ingresso-digital?eventId=:id
```

O frontend mantém um rascunho do pedido no `sessionStorage`, contendo evento,
itens, quantidades e total. O pagamento é explicitamente simulado e nenhuma
cobrança real é realizada.

## Portaria

A rota `/portaria` é exclusiva para `GATE_STAFF` e `ADMIN`. O fluxo abre
diretamente o leitor e também permite digitar o código do ingresso.

O QR Code definitivo deverá carregar somente um identificador ou token
assinado. O backend será responsável por conferir:

- existência e assinatura;
- evento e sessão;
- validade;
- cancelamento;
- uso anterior;
- permissão do operador.

A resposta de validação poderá informar evento, participante, tipo de ingresso,
validade, status e motivo da recusa. Atualmente essa validação ainda é simulada
no frontend.

## Módulos do backend

| Módulo           | Responsabilidade                           |
| ---------------- | ------------------------------------------ |
| `auth`           | Cadastro, login, JWT e renovação de tokens |
| `users`          | Informações e cargos dos usuários          |
| `catalog-events` | Integração com a Ticketmaster              |
| `events`         | Eventos locais dos organizadores           |
| `venues`         | Locais próprios do sistema                 |
| `event-sessions` | Datas e sessões dos eventos                |
| `ticketing`      | Tipos, lotes, preços e estoque             |
| `seat-maps`      | Mapas e assentos                           |
| `orders`         | Pedidos e seus itens                       |
| `payments`       | Pagamentos simulados                       |
| `tickets`        | Emissão e consulta de ingressos            |
| `gate`           | Validação dos ingressos na portaria        |

## Banco de dados

O schema Prisma modela:

- usuários, cargos e status;
- catálogo e eventos locais;
- locais e sessões;
- tipos, lotes e assentos;
- equipe de evento;
- pedidos e itens;
- pagamentos simulados;
- ingressos e validações.

Para visualizar os dados durante o desenvolvimento:

```bash
cd Backend
npx prisma studio
```

## Estado atual

Já funcionam ou estão integrados:

- cadastro e login;
- access token e refresh token automático;
- consulta de usuário e cargos;
- proteção das áreas por autenticação e cargo;
- catálogo, busca, filtros e paginação da Ticketmaster;
- detalhes externos de evento e local;
- continuidade do evento no fluxo visual de compra;
- dashboard do organizador;
- interface de scanner e resultados de validação.

Ainda utilizam mocks ou precisam de persistência no backend:

- importação definitiva de eventos;
- dashboard e eventos do organizador;
- sessões, setores, lotes e estoque;
- pedidos e pagamento simulado;
- emissão dos ingressos;
- leitura e validação real do QR Code.

## Validação do código

Frontend:

```bash
cd Frontend
npm run build
npm run lint
```

Backend:

```bash
cd Backend
npm run build
npm run lint
```
