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
- The Movie Database (TMDb) API v3.

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
THE_MOVIE_DB_CONSUMER_KEY="token-bearer-da-tmdb"
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

## Catálogos externos

A integração externa passa sempre pelo backend para não expor a chave:

```text
Frontend -> Backend -> Ticketmaster / TMDb
```

Rotas atuais:

```http
GET /catalog-events/ticketmaster?keyword=rock&page=0
GET /catalog-events/ticketmaster/:eventId
GET /catalog-events/ticketmaster/venues/:venueId
GET /catalog-events/tmdb/movies?query=Batman&page=1
GET /catalog-events/tmdb/movies/:movieId
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
informado, o backend cria um valor demonstrativo estável entre R$ 10 e R$ 2.000
a partir do ID externo. O mesmo evento recebe sempre o mesmo valor, ao contrário
de um `Math.random()` executado a cada requisição. A resposta marca a origem em
`priceSource` como `ticketmaster` ou `simulated`, e a interface identifica
visualmente preços demonstrativos.

A aba Filmes usa a TMDb com o token enviado pelo backend em `Authorization:
Bearer`. Sem busca, lista filmes em cartaz no Brasil; com busca, consulta títulos.
O backend também transforma os caminhos de pôster e backdrop em URLs completas.

## Eventos e preços locais

A Ticketmaster é uma fonte de catálogo, não a fonte de estoque do Vivaê. Depois
de escolher uma referência externa, o organizador configura no evento local a
data, o endereço e as categorias vendidas, como Pista ou VIP.

Eventos da Ticketmaster usam venda por quantidade. Filmes da TMDb usam assentos
marcados. `Event` guarda data, local e modelo de venda; `TicketType` guarda preço,
capacidade, quantidade reservada e quantidade vendida. Os preços locais são a
fonte de verdade; os catálogos são somente referências.

O frontend poderá enviar `ticketTypeId` e quantidade, mas nunca o preço a ser
confiado. Ao criar um pedido, o backend deverá buscar o tipo no PostgreSQL,
validar estoque, calcular o subtotal e gravar esse snapshot em `OrderItem`. O
pagamento receberá apenas o `orderId` e usará `Order.total`.

### Rotas de eventos locais

```http
GET   /events                 # somente eventos publicados
GET   /events/:id             # detalhe de um evento publicado
GET   /events/mine            # eventos do organizador autenticado
GET   /events/mine/:id        # detalhe privado para edição
POST  /events                 # cria evento e tipos de ingresso
PATCH /events/:id             # edita evento do próprio organizador
PATCH /events/:id/publish     # publica evento do próprio organizador
DELETE /events/:id            # exclui evento sem histórico comercial
```

`/eventos` consome as duas primeiras rotas e nunca lista diretamente resultados
da Ticketmaster. `/organizador/catalogo` é a única tela que navega no catálogo
externo. Ao selecionar um item, o organizador confirma data, local, preço e
capacidade antes de criar o registro local.

Para filmes, o organizador define fileiras e colunas, e o backend cria registros
`Seat`. `OrderItem.seatId` e `Ticket.seatId` são únicos, impedindo no banco que o
mesmo lugar seja reservado ou emitido duas vezes. Quando um pedido expirar ou
for cancelado, o `OrdersService` deverá liberar seu item para disponibilizar o
assento novamente.

O backend obtém `organizerId` pelo JWT e consulta o cargo no banco. Assim, não é
possível criar um evento em nome de outra pessoa nem confiar apenas na proteção
de rotas do React.

A edição de preço e capacidade é recusada depois que houver ingressos reservados
ou vendidos. A exclusão também é recusada quando existirem pedidos, ingressos ou
validações, preservando o histórico da plataforma. Nesses casos, o caminho
correto é posteriormente implementar cancelamento em vez de apagar o registro.

## Compra simulada

O acesso a ingressos, assentos, checkout, resultado da compra e ingressos do
usuário exige login.

O `eventId` acompanha o fluxo:

```text
/eventos/:id
  -> /ingressos?eventId=:id
  -> /checkout?eventId=:id
  -> /sucesso?eventId=:id
  -> /meus-ingressos
  -> /ingresso-digital?ticketId=:id
```

O frontend mantém um rascunho do pedido no `sessionStorage`, contendo evento,
itens, quantidades e total. O pagamento é explicitamente simulado e nenhuma
cobrança real é realizada.

### Onde implementar pedido, pagamento e emissão

Cada módulo deve ter uma responsabilidade diferente:

1. `OrdersService` recebe os IDs dos tipos e as quantidades. Ele busca os preços
   no banco, valida período de venda e estoque, calcula os totais e cria `Order`
   e `OrderItem` com status pendente. O preço enviado pelo frontend nunca deve
   ser usado como fonte de verdade.
2. `PaymentsService` recebe somente o `orderId` e os dados necessários para a
   simulação. Ele busca o pedido pertencente ao usuário, utiliza `Order.total` e
   grava um `Payment` aprovado ou recusado.
3. Quando o pagamento for aprovado, a mesma transação do Prisma altera o pedido
   para pago, atualiza o estoque do tipo e cria um registro `Ticket` para cada
   unidade comprada. Cada ingresso recebe `ownerId`, `eventId`, `orderItemId`,
   `ticketTypeId`, `code`, `qrToken` e `shareToken` únicos.
4. `TicketsService` consulta os ingressos emitidos e, posteriormente, poderá
   concentrar regras de emissão, transferência e cancelamento. Se a emissão for
   extraída para esse serviço, ela deve aceitar o cliente da transação iniciado
   pelo pagamento para que pagamento e ingressos nunca fiquem inconsistentes.

Em resumo, a aprovação ocorre em `payments`, mas os dados finais são gravados em
`Payment`, `Order`, `TicketType` e `Ticket`. Essas alterações devem ser atômicas:
se a criação de qualquer ingresso falhar, toda a aprovação deve ser desfeita.

## Meus ingressos

As telas não possuem mais ingressos fictícios. Elas consomem rotas autenticadas:

```http
GET /tickets/my
GET /tickets/my/:ticketId
```

O backend obtém o usuário pelo `sub` do access token e sempre inclui `ownerId`
na consulta. Dessa forma, não é possível consultar o ingresso de outra pessoa
alterando o ID na URL. A listagem não devolve o `qrToken`; ele aparece somente
na consulta individual protegida, que futuramente alimentará o QR Code real.

Enquanto o fluxo de pagamento ainda não criar registros em `Ticket`, a página
mostrará corretamente o estado vazio. Eventos externos, pedidos pendentes e
pagamentos recusados não são ingressos e, portanto, não aparecem nessa tela.

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
- criação e publicação de evento local a partir do catálogo externo;
- listagem pública somente de eventos locais publicados;
- listagem dos eventos pertencentes ao organizador autenticado;
- continuidade do evento no fluxo visual de compra;
- consulta autenticada dos ingressos pertencentes ao usuário;
- detalhe autenticado de um ingresso emitido;
- dashboard do organizador;
- interface de scanner e resultados de validação.

Ainda utilizam mocks ou precisam de persistência no backend:

- importação definitiva de eventos;
- dashboard e eventos do organizador;
- sessões, setores, lotes e estoque;
- pedidos e pagamento simulado;
- emissão dos ingressos após a aprovação do pagamento;
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
