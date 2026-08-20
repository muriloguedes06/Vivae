# Vivaê

Plataforma de eventos com catálogo externo, organização de eventos, compra
simulada de ingressos e validação de entrada por QR Code.

## Layout

### Eventos publicados

![Página de eventos publicados](./Frontend/public/eventos.png)

### Painel do organizador

![Painel do organizador](./Frontend/public/Organizador.png)

### Portaria

![Portaria](./Frontend/public/Portaria.png)

O repositório é dividido em:

```text
Verzel/
├── Backend/   NestJS, Prisma e PostgreSQL
└── Frontend/  React, TypeScript e Vite
```

Este README é o documento principal do projeto. Conforme novas funcionalidades
forem concluídas, ele será atualizado em vez de substituído por documentos
separados.

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
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
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

Durante o desenvolvimento, o Frontend encaminha requisições iniciadas com
`/api` para `http://localhost:3000`. Para testar a câmera em um celular, o
Frontend pode ser exposto temporariamente por um endereço HTTPS do ngrok.

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

## Dados de demonstração

Execute `npx prisma db seed` dentro de `Backend` para criar os dados exigidos
pelo desafio. Todas as contas usam a senha `Teste@123`.

| Cargo | E-mail |
| --- | --- |
| Organizador | `organizador@vivae.test` |
| Cliente 1 | `cliente1@vivae.test` |
| Cliente 2 | `cliente2@vivae.test` |
| Portaria | `portaria@vivae.test` |

Também é criado o evento publicado `Sessão de Demonstração`, com ingresso de
R$ 40,00 e mapa de 40 assentos.

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

O `eventId` acompanha a seleção e o checkout. Depois do pagamento, o backend
devolve o `ticketId` emitido:

```text
/eventos/:id
  -> /ingressos?eventId=:id
  -> /checkout?eventId=:id
  -> /sucesso?ticketId=:id
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
alterando o ID na URL. A listagem não devolve os tokens; `qrToken` e `shareToken`
aparecem somente na consulta individual protegida.

O QR Code contém o `qrToken` aleatório, enquanto o código curto `VIV-...` aparece
abaixo dele como alternativa para digitação. A portaria aceita as duas formas.

### Compartilhamento público

O proprietário pode compartilhar uma URL criada com o `shareToken`:

```text
/ingresso-compartilhado/:shareToken
```

A página usa a rota pública abaixo, sem exigir que o destinatário tenha uma
conta:

```http
GET /tickets/shared/:shareToken
```

O token é longo e aleatório e funciona como o segredo do link. O botão usa o
compartilhamento nativo do navegador e copia a URL quando essa API não existe.

## Portaria

A rota `/portaria` é exclusiva no frontend para `GATE_STAFF` e `ADMIN`. O
operador seleciona o evento atendido e pode ler o QR pela câmera ou digitar o
código exibido no ingresso.

O backend recebe o evento esperado e o código/token, consulta o ingresso e
retorna um dos estados:

- `VALID`;
- `INVALID`;
- `ALREADY_USED`;
- `WRONG_EVENT`;
- `CANCELLED_TICKET`.

Uma validação aceita altera o ingresso para `USED` e grava uma auditoria em
`TicketValidation`. Se o ingresso pertencer a outro evento, a tentativa também
é registrada, mas o acesso é recusado com `WRONG_EVENT`.

## Módulos do backend

| Módulo           | Responsabilidade                           |
| ---------------- | ------------------------------------------ |
| `auth`           | Cadastro, login, JWT e renovação de tokens |
| `users`          | Informações e cargos dos usuários          |
| `catalog-events` | Integração com a Ticketmaster              |
| `events`         | Eventos locais dos organizadores           |
| `orders`         | Pedidos e seus itens                       |
| `payments`       | Pagamentos simulados                       |
| `tickets`        | Emissão e consulta de ingressos            |
| `gate`           | Validação dos ingressos na portaria        |

## Banco de dados

O schema Prisma modela:

- usuários, cargos e status;
- eventos locais originados ou não dos catálogos externos;
- tipos de ingresso e assentos;
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
- reserva por quantidade e por assento com preços calculados no backend;
- pagamento simulado com aprovação e recusa;
- emissão de ingressos após pagamento aprovado;
- consulta autenticada dos ingressos pertencentes ao usuário;
- detalhe autenticado de um ingresso emitido;
- QR Code real baseado em token aleatório;
- compartilhamento público por link com `shareToken`;
- dashboard do organizador;
- leitura real pela câmera e alternativa por digitação;
- validação persistida com ingresso válido, inválido, já utilizado, cancelado
  ou pertencente a outro evento.

Antes da entrega final ainda podem ser melhorados:

- autorização de cargos também nas rotas sensíveis do backend;
- liberação automática de reservas abandonadas;
- testes básicos dos principais fluxos.

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
