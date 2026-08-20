# Backend do Vivaê

API da plataforma Vivaê, construída com NestJS, Prisma ORM e PostgreSQL.

O Backend concentra as regras de negócio e funciona como fonte de verdade para:

- autenticação e cargos;
- consumo da Ticketmaster e TMDb;
- criação e publicação de eventos locais;
- preços, capacidade e assentos;
- reservas e pedidos;
- pagamento simulado;
- emissão de ingressos;
- links públicos de compartilhamento;
- validação dos ingressos na portaria.

## Tecnologias

- Node.js;
- NestJS 11;
- TypeScript;
- Prisma ORM 6;
- PostgreSQL;
- JWT;
- bcrypt;
- Ticketmaster Discovery API v2;
- The Movie Database API v3.

## Estrutura principal

```text
Backend/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── catalog-events/
│   │   ├── events/
│   │   ├── gate/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── tickets/
│   │   └── users/
│   ├── prisma/
│   ├── app.module.ts
│   └── main.ts
└── test/
```

Os módulos vazios `venues`, `ticketing` e `seat-maps` foram removidos. Suas
responsabilidades já são atendidas pelo modelo atual:

- o local fica dentro de `Event`;
- preços e estoque ficam em `TicketType`;
- os lugares marcados ficam em `Seat`;
- as regras desses dados são aplicadas por `EventsService` e `OrdersService`.

## Variáveis de ambiente

Crie `Backend/.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/verzel"
JWT_SECRET="segredo-do-access-token"
JWT_REFRESH_SECRET="segredo-diferente-do-refresh-token"
TICKET_MASTER_CONSUMER_KEY="chave-da-ticketmaster"
THE_MOVIE_DB_CONSUMER_KEY="token-bearer-da-tmdb"
PORT=3000
```

Não publique chaves ou segredos no repositório.

## Instalação

```bash
cd Backend
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

Durante o desenvolvimento, a API utiliza:

```text
http://localhost:3000
```

O servidor escuta em `0.0.0.0`, permitindo acesso por proxy local, rede ou
túnel HTTPS durante os testes.

## Dados de demonstração

O seed pode ser executado mais de uma vez sem duplicar os registros:

```bash
npx prisma db seed
```

Todas as contas usam a senha:

```text
Teste@123
```

| Cargo | E-mail |
| --- | --- |
| Organizador | `organizador@vivae.test` |
| Cliente 1 | `cliente1@vivae.test` |
| Cliente 2 | `cliente2@vivae.test` |
| Portaria | `portaria@vivae.test` |

O seed também cria o evento publicado `Sessão de Demonstração`, com preço de
R$ 40,00 e 40 assentos identificados de `A1` até `E8`.

## Comandos

```bash
npm run start:dev
npm run build
npm run lint
npm run test
npm run test:e2e
npx prisma studio
```

O teste e2e padrão do Nest ainda precisa ser substituído por testes dos fluxos
reais da aplicação.

## Autenticação

As rotas protegidas esperam:

```http
Authorization: Bearer ACCESS_TOKEN
```

O access token dura 15 minutos. O refresh token dura 7 dias e utiliza um
segredo separado.

Papéis existentes:

| Papel | Responsabilidade |
| --- | --- |
| `CUSTOMER` | Reserva, paga e consulta seus ingressos |
| `ORGANIZER` | Cria e gerencia os próprios eventos |
| `GATE_STAFF` | Valida ingressos na portaria |
| `ADMIN` | Papel administrativo |

## Endpoints

As rotas marcadas como **JWT** exigem access token. As rotas públicas podem ser
consultadas sem autenticação.

### Autenticação — `/auth`

#### `POST /auth/register` — público

Cadastra um cliente.

```json
{
  "username": "murilodev",
  "lastname": "Guedes",
  "email": "murilo@example.com",
  "password": "123456"
}
```

O cadastro comum cria um usuário com o papel padrão `CUSTOMER`.

#### `POST /auth/login` — público

```json
{
  "email": "murilo@example.com",
  "password": "123456"
}
```

Resposta principal:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user": {
    "username": "murilodev",
    "lastname": "Guedes",
    "email": "murilo@example.com",
    "role": "CUSTOMER"
  }
}
```

#### `POST /auth/refresh` — público com refresh token

```json
{
  "refresh_token": "REFRESH_TOKEN"
}
```

Devolve um novo access token e um novo refresh token.

### Usuários — `/users`

#### `GET /users/informations` — JWT

Retorna nome, sobrenome, e-mail e cargo do usuário autenticado. É utilizado pelo
Frontend para decidir quais áreas podem ser abertas.

### Catálogo externo — `/catalog-events`

Essas rotas são públicas. As chaves externas permanecem somente no Backend.

#### `GET /catalog-events/ticketmaster`

Parâmetros:

| Parâmetro | Obrigatório | Descrição |
| --- | --- | --- |
| `keyword` ou `query` | Não | Texto procurado |
| `page` | Não | Página, iniciando em `0` |

Exemplo:

```http
GET /catalog-events/ticketmaster?keyword=rock&page=0
```

#### `GET /catalog-events/ticketmaster/:id`

Retorna detalhes de um evento da Ticketmaster.

#### `GET /catalog-events/ticketmaster/venues/:id`

Retorna o local externo relacionado à Ticketmaster. Essa rota não representa um
módulo local de locais; ela apenas consulta o catálogo externo.

#### `GET /catalog-events/tmdb/movies`

Parâmetros:

| Parâmetro | Obrigatório | Descrição |
| --- | --- | --- |
| `query` | Não | Título procurado; sem texto, lista filmes em cartaz |
| `page` | Não | Página, iniciando em `1` |

Exemplo:

```http
GET /catalog-events/tmdb/movies?query=Batman&page=1
```

#### `GET /catalog-events/tmdb/movies/:id`

Retorna os detalhes de um filme da TMDb.

### Eventos locais — `/events`

O catálogo externo não é vendido diretamente. O organizador escolhe uma
referência e cria um `Event` local com data, local, capacidade e preço próprios.

#### `GET /events` — público

Lista somente eventos com status `PUBLISHED`.

Parâmetro opcional:

```http
GET /events?query=festival
```

#### `GET /events/:id` — público

Retorna um evento publicado com tipos de ingresso e assentos.

#### `GET /events/mine` — JWT, organizador

Lista os eventos pertencentes ao organizador autenticado.

#### `GET /events/mine/:id` — JWT, organizador

Retorna um evento do organizador para edição.

#### `POST /events` — JWT, organizador

Exemplo para venda por quantidade:

```json
{
  "externalSource": "TICKETMASTER",
  "externalId": "K8vZ9171G-7",
  "title": "Festival de Rock",
  "description": "Descrição do evento",
  "category": "CONCERT",
  "ticketingMode": "GENERAL_ADMISSION",
  "coverUrl": "https://example.com/imagem.jpg",
  "venueName": "Arena Central",
  "address": "Rua Principal, 100",
  "city": "São Paulo",
  "state": "SP",
  "startsAt": "2026-09-20T21:00:00.000Z",
  "publish": true,
  "ticketTypes": [
    {
      "name": "Pista",
      "description": "Entrada geral",
      "price": 100,
      "capacity": 500
    }
  ]
}
```

Para lugares marcados:

```json
{
  "externalSource": "TMDB",
  "externalId": "550",
  "title": "Sessão de cinema",
  "description": "Exibição do filme",
  "category": "MOVIE",
  "ticketingMode": "RESERVED_SEATING",
  "venueName": "Cinema Central",
  "address": "Avenida Principal, 200",
  "city": "São Paulo",
  "state": "SP",
  "startsAt": "2026-09-20T21:00:00.000Z",
  "publish": true,
  "seatMap": {
    "rows": 5,
    "columns": 8
  },
  "ticketTypes": [
    {
      "name": "Inteira",
      "price": 40,
      "capacity": 40
    }
  ]
}
```

#### `PATCH /events/:id` — JWT, organizador

Atualiza um evento pertencente ao usuário. Utiliza o mesmo formato do cadastro.
Preço, capacidade e mapa não podem ser alterados depois do início das vendas.

#### `PATCH /events/:id/publish` — JWT, organizador

Publica um evento que já possui tipos de ingresso configurados.

#### `DELETE /events/:id` — JWT, organizador

Exclui somente eventos sem pedidos, ingressos ou validações.

### Pedidos — `/orders`

Todas as rotas deste grupo exigem JWT.

#### `POST /orders`

Cria uma reserva e calcula o valor usando os preços do banco.

Venda por quantidade:

```json
{
  "eventId": "EVENT_ID",
  "items": [
    {
      "ticketTypeId": "TICKET_TYPE_ID",
      "quantity": 2
    }
  ]
}
```

Venda por assento:

```json
{
  "eventId": "EVENT_ID",
  "items": [
    {
      "ticketTypeId": "TICKET_TYPE_ID",
      "seatIds": ["SEAT_ID_1", "SEAT_ID_2"]
    }
  ]
}
```

Regras principais:

- entre 1 e 6 ingressos por pedido;
- evento precisa estar publicado;
- preço é consultado no Backend;
- estoque e assentos são reservados;
- pedido começa como `PENDING`;
- reserva expira em 10 minutos.

#### `GET /orders/my`

Lista os pedidos do usuário autenticado.

#### `GET /orders/my/:id`

Retorna um pedido pertencente ao usuário.

#### `PATCH /orders/:id/cancel`

Cancela um pedido `PENDING` e devolve a reserva ao estoque.

### Pagamentos — `/payments`

Todas as rotas deste grupo exigem JWT. Não existe cobrança financeira real.

#### `POST /payments/simulate`

```json
{
  "orderId": "ORDER_ID",
  "cardholderName": "Murilo Guedes",
  "cardNumber": "4242 4242 4242 4242",
  "expiry": "01/35",
  "cvv": "426"
}
```

Esse cartão aprova a simulação. Dados diferentes recusam o pagamento.

Quando aprovado, a mesma transação:

1. cria `Payment` como `APPROVED`;
2. muda `Order` para `PAID`;
3. converte estoque reservado em vendido;
4. cria um `Ticket` para cada unidade;
5. gera `code`, `qrToken` e `shareToken` únicos.

#### `GET /payments/order/:orderId`

Lista as tentativas de pagamento de um pedido pertencente ao usuário.

### Ingressos — `/tickets`

#### `GET /tickets/my` — JWT

Lista os ingressos do usuário autenticado.

#### `GET /tickets/my/:id` — JWT

Retorna o ingresso do usuário, incluindo `qrToken` e `shareToken`.

#### `GET /tickets/shared/:shareToken` — público

Retorna um ingresso a partir do segredo presente no link compartilhável. O
`ticketId` não funciona como credencial pública.

### Portaria — `/gate`

#### `POST /gate/validate` — JWT

```json
{
  "code": "QR_TOKEN_OU_CODIGO_VIV",
  "eventId": "EVENT_ID_DA_PORTARIA"
}
```

O campo `code` aceita:

- o `qrToken` lido pela câmera;
- o código curto `VIV-...` digitado manualmente.

Resultados possíveis:

| Status | Significado |
| --- | --- |
| `VALID` | Entrada permitida; ingresso alterado para `USED` |
| `INVALID` | Código ou token inexistente |
| `ALREADY_USED` | Ingresso já validado anteriormente |
| `WRONG_EVENT` | Ingresso pertence a outro evento |
| `CANCELLED_TICKET` | Ingresso ou evento cancelado/encerrado |

Tentativas relacionadas a um ingresso são registradas em `TicketValidation`.

## Modelos do banco

| Modelo | Responsabilidade |
| --- | --- |
| `User` | Conta, senha, cargo e status |
| `Event` | Evento local, data, local e modelo de venda |
| `TicketType` | Nome, preço, capacidade, reservados e vendidos |
| `Seat` | Lugar de um evento com assentos marcados |
| `Order` | Reserva e estado geral da compra |
| `OrderItem` | Snapshot de preço, quantidade e assento |
| `Payment` | Resultado da cobrança simulada |
| `Ticket` | Ingresso emitido após aprovação |
| `TicketValidation` | Auditoria das leituras da portaria |

## Segurança e integridade

- senhas são armazenadas com bcrypt;
- tokens JWT utilizam segredos do ambiente;
- chamadas externas e chaves ficam no Backend;
- o preço enviado pelo navegador não é utilizado;
- consultas pessoais filtram pelo usuário do JWT;
- `OrderItem.seatId` é único;
- `Ticket.seatId` é único;
- reservas e pagamentos utilizam transações do Prisma;
- QR e compartilhamento usam tokens aleatórios diferentes;
- um ingresso utilizado muda para `USED`.

## Limitações conhecidas

- a verificação de cargo ainda não foi aplicada a todas as rotas protegidas;
- pedidos abandonados não são liberados automaticamente por uma rotina;
- duas validações exatamente simultâneas ainda merecem uma atualização
  condicional atômica;
- o teste e2e padrão do Nest está desatualizado;
- não existe deploy permanente.

Essas limitações e o estado geral da entrega também estão registrados em
`../completed.md`.
